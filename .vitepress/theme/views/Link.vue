<!-- 友情链接 -->
<template>
  <div class="link">
    <!-- 顶图 -->
    <Banner type="page" title="友情链接" desc="与各位博主无限进步">
      <template v-slot:header-slot>
        <div class="menu">
          <div class="menu-item random" @click="randomJump">
            <i class="iconfont icon-shuffle" />
            <span class="name">随机访问</span>
          </div>
          <div class="menu-item add" @click="smoothScrolling('#友情链接申请')">
            <i class="iconfont icon-right-round" />
            <span class="name">申请友链</span>
          </div>
        </div>
      </template>
      <!-- 友链头像轮播 -->
      <div class="link-group">
        <div class="tags-group-wrapper">
          <!-- 第一行 -->
          <div class="tags-group-row tags-group-row-1">
            <div class="tags-group-icons">
              <template v-for="(pair, index) in row1Pairs" :key="`row1-${index}`">
                <div class="tags-group-icon-pair">
                  <a
                    v-for="(link, linkIndex) in pair"
                    :key="`row1-${index}-${linkIndex}`"
                    :href="link.url"
                    class="tags-group-icon"
                    :title="link.name"
                    target="_blank"
                  >
                    <img
                      :src="link.avatar"
                      :alt="link.name"
                      @error="handleImageError"
                    />
                  </a>
                </div>
              </template>
            </div>
            <!-- 复制一份用于无缝循环 -->
            <div class="tags-group-icons" aria-hidden="true">
              <template v-for="(pair, index) in row1Pairs" :key="`row1-copy-${index}`">
                <div class="tags-group-icon-pair">
                  <a
                    v-for="(link, linkIndex) in pair"
                    :key="`row1-copy-${index}-${linkIndex}`"
                    :href="link.url"
                    class="tags-group-icon"
                    :title="link.name"
                    target="_blank"
                  >
                    <img
                      :src="link.avatar"
                      :alt="link.name"
                      @error="handleImageError"
                    />
                  </a>
                </div>
              </template>
            </div>
          </div>
          <!-- 第二行 -->
          <div class="tags-group-row tags-group-row-2">
            <div class="tags-group-icons">
              <template v-for="(pair, index) in row2Pairs" :key="`row2-${index}`">
                <div class="tags-group-icon-pair">
                  <a
                    v-for="(link, linkIndex) in pair"
                    :key="`row2-${index}-${linkIndex}`"
                    :href="link.url"
                    class="tags-group-icon"
                    :title="link.name"
                    target="_blank"
                  >
                    <img
                      :src="link.avatar"
                      :alt="link.name"
                      @error="handleImageError"
                    />
                  </a>
                </div>
              </template>
            </div>
            <!-- 复制一份用于无缝循环 -->
            <div class="tags-group-icons" aria-hidden="true">
              <template v-for="(pair, index) in row2Pairs" :key="`row2-copy-${index}`">
                <div class="tags-group-icon-pair">
                  <a
                    v-for="(link, linkIndex) in pair"
                    :key="`row2-copy-${index}-${linkIndex}`"
                    :href="link.url"
                    class="tags-group-icon"
                    :title="link.name"
                    target="_blank"
                  >
                    <img
                      :src="link.avatar"
                      :alt="link.name"
                      @error="handleImageError"
                    />
                  </a>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Banner>
    <!-- 友链数据 -->
    <LinkList :listData="linkData" :useFriendsLink="true" statusJsonUrl="https://fc.2005815.xyz/link.json" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { smoothScrolling } from "@/utils/helper";
import linkData from "@/assets/linkData.mjs";

// 全部友链
const allLinkData = computed(() => {
  return linkData.flatMap((item) => item.typeList);
});

// 将友链分成两组，交替分配到两行
const linkPairs = computed(() => {
  let links = allLinkData.value;

  // 如果友链数量太少，复制填充以确保轮播效果能填满屏幕
  // 每个头像约82px(70px + 12px间距)，屏幕宽度按1920px计算，需要约23个头像
  // 复制到至少24个，确保两行都有足够内容
  const minLinks = 24;
  if (links.length > 0 && links.length < minLinks) {
    const originalLinks = [...links];
    while (links.length < minLinks) {
      links = links.concat(originalLinks);
    }
  }

  const row1 = []; // 第一行
  const row2 = []; // 第二行

  // 交替分配到两行
  links.forEach((link, index) => {
    if (index % 2 === 0) {
      row1.push(link);
    } else {
      row2.push(link);
    }
  });

  // 将每行分成每两个一对
  const toPairs = (arr) => {
    const pairs = [];
    for (let i = 0; i < arr.length; i += 2) {
      const pair = [];
      if (arr[i]) pair.push(arr[i]);
      if (arr[i + 1]) pair.push(arr[i + 1]);
      if (pair.length > 0) pairs.push(pair);
    }
    return pairs;
  };

  return {
    row1: toPairs(row1),
    row2: toPairs(row2),
  };
});

// 第一行配对
const row1Pairs = computed(() => linkPairs.value.row1);

// 第二行配对
const row2Pairs = computed(() => linkPairs.value.row2);

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = "https://cdn.jsdelivr.net/npm/fluent-emoji@1.0.0/icons/link.png";
};

// 随机跳转
const randomJump = () => {
  try {
    const friendList = allLinkData.value;
    const randomList = friendList[Math.floor(Math.random() * friendList.length)];
    $message.warning(
      `您即将前往 ${randomList?.name}，请注意链接是否安全`,
      {
        close: true,
        duration: 2000,
      },
      () => {
        if (randomList?.url) window.open(randomList.url, "_blank");
      },
    );
  } catch (error) {
    console.error("友链随机访问时出错：", error);
    $message.error("友链随机访问时出错，请重试");
  }
};
</script>

<style lang="scss" scoped>
.link {
  margin-bottom: 4rem;

  .banner-page {
    min-height: 360px;
    padding-bottom: 200px;
    position: relative;
    overflow: hidden;

    .menu {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
      margin-bottom: auto;

      .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 46px;
        padding: 12px 18px;
        border-radius: 8px;
        background-color: var(--main-card-second-background);
        border: 1px solid var(--main-card-border);
        box-shadow: 0 8px 16px -4px var(--main-border-shadow);
        transition: all 0.3s;
        cursor: pointer;

        .iconfont {
          font-size: 18px;
          margin-right: 8px;
          transition: color 0.3s;
        }

        &.random {
          color: var(--main-color);
          .iconfont {
            color: var(--main-color);
          }
        }

        &.add {
          color: var(--main-card-second-background);
          background-color: var(--main-font-color);
          .iconfont {
            font-size: 22px;
            margin-right: 6px;
            color: var(--main-card-second-background);
          }
        }

        &:last-child {
          margin-left: 20px;
        }

        &:hover {
          color: #fff;
          background-color: var(--main-color);
          box-shadow: 0 8px 16px -4px var(--main-color-bg);
          .iconfont {
            color: #fff;
          }
        }
      }
    }

    // 友链轮播区域
    .link-group {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 24px;
      width: 100%;
      overflow: hidden;

      .tags-group-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .tags-group-row {
          display: flex;
          overflow: hidden;
          width: 100%;

          .tags-group-icons {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            flex-shrink: 0;
            animation: scroll-left 60s linear infinite;

            .tags-group-icon-pair {
              display: flex;
              flex-direction: row;
              gap: 12px;
              margin-right: 12px;
              flex-shrink: 0;
            }
          }

          // 第二行反向滚动
          &.tags-group-row-2 .tags-group-icons {
            animation: scroll-right 60s linear infinite;
          }

          // 悬停时暂停动画
          &:hover .tags-group-icons {
            animation-play-state: paused;
          }
        }

        .tags-group-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: var(--main-card-second-background);
          border: 2px solid var(--main-card-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          flex-shrink: 0;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          &:hover {
            transform: scale(1.15);
            border-color: var(--main-color);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

            img {
              transform: scale(1.1);
            }
          }
        }
      }
    }

    @keyframes scroll-left {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }

    @keyframes scroll-right {
      0% {
        transform: translateX(-50%);
      }
      100% {
        transform: translateX(0);
      }
    }

    // 移动端适配
    @media (max-width: 800px) {
      min-height: 320px;
      padding-bottom: 160px;

      .menu {
        display: none;
      }

      .link-group {
        bottom: 16px;

        .tags-group-wrapper {
          gap: 10px;

          .tags-group-icon {
            width: 52px;
            height: 52px;
          }

          .tags-group-icon-pair {
            gap: 10px;
            margin-right: 10px;
          }
        }
      }
    }

    @media (max-width: 480px) {
      min-height: 300px;
      padding-bottom: 140px;

      .link-group {
        .tags-group-wrapper {
          gap: 8px;

          .tags-group-icon {
            width: 44px;
            height: 44px;
          }

          .tags-group-icon-pair {
            gap: 8px;
            margin-right: 8px;
          }
        }
      }
    }
  }
}
</style>
