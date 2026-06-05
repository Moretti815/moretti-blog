<template>
  <Transition name="fade" mode="out-in">
    <div v-if="listData?.length" class="link-list">
      <div v-for="(type, index) in listData" :key="index" class="link-type-list">
        <div class="title">
          <h2 class="name">
            <span class="name-text">{{ type?.typeName || "未知分组" }}</span>
            <span v-if="showCount" class="name-count">（{{ type?.typeList?.length || 0 }}）</span>
          </h2>
          <span class="tip">{{ type?.typeDesc || "分组暂无简介" }}</span>
        </div>
        <div class="all-link" v-if="type?.typeList">
          <a
            v-for="(link, index) in type.typeList"
            :class="[
              'link-card',
              's-card',
              {
                loss: type?.type === 'loss',
                'cf-friends-link': type?.type !== 'loss' && useFriendsLink,
                'has-snapshot': link.snapshot,
              },
            ]"
            :key="index"
            :href="type?.type !== 'loss' ? link.url : null"
            target="_blank"
            :data-link-url="link.url"
          >
            <!-- 延迟状态标签 -->
            <div
              v-if="getLinkStatus(link.url)"
              class="status-tag"
              :class="getLinkStatus(link.url)?.className"
            >
              {{ getLinkStatus(link.url)?.text }}
            </div>
            <!-- 截图 -->
            <div v-if="link.snapshot" class="snapshot">
              <LazyLoader>
                <img
                  :src="link.snapshot"
                  class="snapshot-img"
                  :alt="link?.name || 'snapshot'"
                  @load="(e) => e.target.classList.add('loaded')"
                />
              </LazyLoader>
            </div>
            <div class="link-content">
              <div class="cover">
                <LazyLoader :useFriendsLink="link.avatar || link.ico">
                  <img
                    :src="link.avatar || link.ico"
                    :class="['cover-img', { 'cf-friends-avatar': useFriendsLink }]"
                    :alt="link?.name || 'cover'"
                    @load="(e) => e.target.classList.add('loaded')"
                  />
                </LazyLoader>
              </div>
              <div class="data">
                <div class="name-row">
                  <span :class="['name', { 'cf-friends-name': useFriendsLink }]">{{ link.name }}</span>
                  <!-- RSS 链接 -->
                  <a
                    v-if="link.feed"
                    :href="link.feed"
                    class="rss-link"
                    target="_blank"
                    @click.stop
                    title="RSS订阅"
                  >
                    <i class="iconfont icon-rss" />
                  </a>
                </div>
                <span class="desc">{{ link.desc }}</span>
                <!-- 标签 -->
                <div v-if="link.tags" class="tags">
                  <span
                    v-for="(tag, tagIndex) in formatTags(link.tags)"
                    :key="tagIndex"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
    <div v-else class="no-data">暂无友链数据</div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  // 列表数据
  listData: {
    type: [Array, String],
    default: () => [],
  },
  // 显示数量
  showCount: {
    type: Boolean,
    default: true,
  },
  // 友链朋友圈
  useFriendsLink: {
    type: Boolean,
    default: false,
  },
  // 延迟检测 JSON 地址
  statusJsonUrl: {
    type: String,
    default: '',
  },
});

// 链接状态数据
const linkStatusMap = ref(new Map());

// 格式化标签
const formatTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(/[,，]/).map(tag => tag.trim()).filter(Boolean);
};

// 获取链接状态
const getLinkStatus = (url) => {
  if (!url) return null;
  const normalizedUrl = url.replace(/\/$/, '');
  return linkStatusMap.value.get(normalizedUrl) || null;
};

// 加载延迟检测数据
const loadStatusData = async () => {
  if (!props.statusJsonUrl) return;

  const cacheKey = 'linkStatusData';
  const cacheExpirationTime = 30 * 60 * 1000; // 半小时

  // 尝试从缓存读取
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < cacheExpirationTime) {
        applyStatusData(data);
        return;
      }
    }
  } catch (e) {
    console.error('读取缓存失败:', e);
  }

  // 从网络获取
  try {
    const response = await fetch(props.statusJsonUrl);
    const data = await response.json();
    applyStatusData(data);

    // 保存到缓存
    const cacheData = {
      data: data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('获取延迟检测数据失败:', error);
  }
};

// 应用状态数据
const applyStatusData = (data) => {
  // 支持两种数据格式：新的 link_data 或旧的 link_status
  const linkData = data?.link_data || data?.link_status;
  if (!linkData) return;

  const newMap = new Map();
  linkData.forEach((item) => {
    // 新的 API 使用 link 字段，旧的 API 也使用 link 字段
    const link = item.link?.replace(/\/$/, '');
    if (!link) return;

    let text = '未知';
    let className = 'status-tag-red';

    if (item.latency === -1) {
      text = '未知';
    } else {
      const latencySec = item.latency;
      text = latencySec.toFixed(2) + 's';

      if (latencySec <= 2) {
        className = 'status-tag-green';
      } else if (latencySec <= 5) {
        className = 'status-tag-light-yellow';
      } else if (latencySec <= 10) {
        className = 'status-tag-dark-yellow';
      }
    }

    newMap.set(link, { text, className, latency: item.latency });
  });

  linkStatusMap.value = newMap;
};

onMounted(() => {
  loadStatusData();
});
</script>

<style lang="scss" scoped>
.link-list {
  .link-type-list {
    margin-top: 2rem;
    .title {
      margin-left: 6px;
      margin-bottom: 1.6rem;
      .name {
        border-bottom: none;
        margin-bottom: 4px;
        .name-count {
          color: var(--main-font-second-color);
        }
      }
      .tip {
        color: var(--main-font-second-color);
      }
    }
    .all-link {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(5, 1fr);
      .link-card {
        display: flex;
        flex-direction: column;
        height: auto;
        width: 100%;
        padding: 0;
        overflow: hidden;
        transition: all 0.3s;
        position: relative;

        &.loss {
          pointer-events: none;
        }

        // 延迟状态标签
        .status-tag {
          position: absolute;
          top: 0;
          left: 0;
          padding: 3px 8px;
          border-radius: 12px 0px 12px 0px;
          font-size: 12px;
          color: white;
          font-weight: bold;
          transition: font-size 0.3s ease-out, opacity 0.3s ease-out;
          z-index: 10;
        }

        .status-tag-green {
          background-color: #005E00;
        }

        .status-tag-light-yellow {
          background-color: #FED101;
          color: #333;
        }

        .status-tag-dark-yellow {
          background-color: #F0B606;
          color: #333;
        }

        .status-tag-red {
          background-color: #B90000;
        }

        &:hover .status-tag {
          font-size: 0;
          opacity: 0;
        }

        // 截图样式
        .snapshot {
          width: 100%;
          height: 140px;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            var(--main-card-border) 25%,
            var(--main-card-background) 37%,
            var(--main-card-border) 63%
          );
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;

          .snapshot-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            filter: blur(10px);
            transition: filter 0.3s, opacity 0.3s;

            &.loaded {
              opacity: 1;
              filter: blur(0);
            }
          }
        }

        .link-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 12px;
          flex: 1;
        }

        .cover {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          min-width: 60px;
          margin-right: 16px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            var(--main-card-border) 25%,
            var(--main-card-background) 37%,
            var(--main-card-border) 63%
          );
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
          transition: all 0.6s;
          .cover-img {
            width: 100%;
            height: 100%;
            background-color: var(--main-card-background);
            opacity: 0;
            filter: blur(10px);
            transition:
              filter 0.3s,
              opacity 0.3s;
            &.loaded {
              opacity: 1;
              filter: blur(0);
            }
          }
        }
        .data {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;

          .name-row {
            display: flex;
            align-items: center;
            width: 100%;
            gap: 8px;

            .name {
              font-weight: bold;
              font-size: 18px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              line-clamp: 1;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
              white-space: nowrap;
              flex: 1;
              min-width: 0;
            }

            .rss-link {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: var(--main-color);
              color: #fff;
              font-size: 12px;
              transition: all 0.3s;
              flex-shrink: 0;

              &:hover {
                transform: scale(1.1);
                box-shadow: 0 2px 8px var(--main-color-bg);
              }

              .iconfont {
                font-size: 12px;
              }
            }
          }

          .desc {
            font-size: 14px;
            margin-top: 4px;
            line-height: 1.4;
            color: var(--main-font-second-color);
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            transition:
              color 0.3s,
              opacity 0.3s;
          }

          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;

            .tag {
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 4px;
              background-color: var(--main-color-bg);
              color: var(--main-color);
              white-space: nowrap;
            }
          }
        }

        &:hover {
          color: var(--main-card-background);
          background-color: var(--main-color);
          border-color: var(--main-color);
          box-shadow: 0 0 16px 6px var(--main-color-bg);

          .snapshot {
            .snapshot-img {
              transform: scale(1.05);
            }
          }

          .link-content {
            .cover {
              margin-right: 6px;
              min-width: 0;
              opacity: 0;
              width: 0;
              height: 0;
            }
            .data {
              .desc {
                opacity: 0.7;
                color: var(--main-card-background);
              }
              .tags {
                .tag {
                  background-color: rgba(255, 255, 255, 0.2);
                  color: var(--main-card-background);
                }
              }
            }
          }
        }
      }
      @media (max-width: 1200px) {
        grid-template-columns: repeat(4, 1fr);
      }
      @media (max-width: 992px) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .link-card {
          .snapshot {
            height: 120px;
          }

          .link-content {
            padding: 10px;

            .cover {
              width: 48px;
              height: 48px;
              min-width: 48px;
              margin-right: 12px;
            }

            .data {
              .name-row {
                .name {
                  font-size: 16px;
                }
              }

              .desc {
                font-size: 13px;
              }

              .tags {
                margin-top: 6px;

                .tag {
                  font-size: 11px;
                  padding: 2px 6px;
                }
              }
            }
          }
        }
      }
      @media (max-width: 576px) {
        grid-template-columns: 1fr;
      }
    }
  }
}
.no-data {
  text-align: center;
  margin-top: 40px;
  font-size: 1.4rem;
  font-weight: bold;
}
</style>
