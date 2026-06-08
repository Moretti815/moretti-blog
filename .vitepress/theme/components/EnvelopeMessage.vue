<!-- 信封留言板组件 -->
<template>
  <div class="envelope-message">
    <div id="maincontent">
      <div id="form-wrap" :style="formWrapStyle">
        <img id="beforeimg" class="no-lightbox" :src="config.beforeimg" alt="信封前部" />
        <div id="envelope">
          <form>
            <div class="formmain" style="pointer-events: none;">
              <img class="headerimg no-lightbox" :src="config.cover" alt="信笺头部" />
              <div class="comments-main">
                <h3 class="title3">来自 {{ siteMeta.author?.name || '博主' }} 的留言:</h3>
                <div class="comments">
                  <div v-for="(line, index) in config.message" :key="index">{{ line }}</div>
                </div>
                <div class="bottomcontent">
                  <img class="bottomimg no-lightbox" :src="config.line" alt="信笺底部" />
                </div>
                <p class="bottomhr">{{ config.bottom }}</p>
              </div>
            </div>
          </form>
        </div>
        <img id="afterimg" class="no-lightbox" :src="config.afterimg" alt="信封后部" />
      </div>
    </div>
    <!-- 评论区域 -->
    <div class="envelope-comments">
      <Comments />
    </div>
  </div>
</template>

<script setup>
import Comments from "./Plugins/Comments/index.vue";

const { theme, site } = useData();

// 站点信息
const siteMeta = computed(() => theme.value.siteMeta || {});

// 信封配置
const config = computed(() => {
  const defaultConfig = {
    cover: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/violet.jpg",
    line: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/line.png",
    beforeimg: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/before.png",
    afterimg: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/after.png",
    message: [
      "有什么想问的？",
      "有什么想说的？",
      "有什么想吐槽的？",
      "哪怕是有什么想吃的，都可以告诉我哦~"
    ],
    bottom: "自动书记人偶竭诚为您服务！",
    height: "1024px"
  };
  return { ...defaultConfig, ...(theme.value.envelope || {}) };
});

// 动态计算高度样式
const formWrapStyle = computed(() => {
  return {
    '--envelope-height': config.value.height || '1024px'
  };
});
</script>

<style lang="scss" scoped>
.envelope-message {
  width: 100%;
  padding: 20px 0;
}

#maincontent {
  width: 100%;
  max-width: 530px;
  margin: 0 auto;
}

#form-wrap {
  overflow: hidden;
  height: 447px;
  position: relative;
  top: 0px;
  transition: all 1s ease-in-out 0.3s;
  z-index: 0;
}

#form-wrap:hover {
  height: var(--envelope-height, 1024px);
  top: -200px;
}

#beforeimg {
  position: absolute;
  bottom: 126px;
  left: 0px;
  background-repeat: no-repeat;
  width: 530px;
  height: 317px;
  z-index: -100;
  pointer-events: none;
}

#afterimg {
  position: absolute;
  bottom: -2px;
  left: 0;
  background-repeat: no-repeat;
  width: 530px;
  height: 259px;
  z-index: 100;
  pointer-events: none;
}

#envelope {
  position: relative;
  overflow: visible;
  width: 500px;
  margin: 0px auto;
  transition: all 1s ease-in-out 0.3s;
  padding-top: 200px;
}

.formmain {
  background: white;
  width: 95%;
  max-width: 800px;
  margin: auto auto;
  border-radius: 5px;
  border: 1px solid #ddd;
  overflow: hidden;
  -webkit-box-shadow: 0px 0px 20px 0px #000000;
  box-shadow: 0px 0px 20px 0px #000000;
}

.headerimg {
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  display: block;
}

.comments-main {
  padding: 0 20px 20px;
}

.title3 {
  text-decoration: none;
  color: var(--main-color, #3b82f6);
  text-align: center;
  font-size: 18px;
  margin: 15px 0;
}

.comments {
  text-align: center;
  border-bottom: #ddd 1px solid;
  border-left: #ddd 1px solid;
  padding-bottom: 20px;
  background-color: #eee;
  margin: 15px 0px;
  padding-left: 20px;
  padding-right: 20px;
  border-top: #ddd 1px solid;
  border-right: #ddd 1px solid;
  padding-top: 20px;

  div {
    margin: 8px 0;
    color: #333;
    font-size: 14px;
  }
}

.bottomcontent {
  text-align: center;
  margin-top: 40px;
}

.bottomimg {
  width: 100%;
  margin: 5px auto 5px auto;
  display: block;
  pointer-events: none;
}

.bottomhr {
  font-size: 12px;
  text-align: center;
  color: #999;
  margin: 10px 0 0;
}

// 评论区域
.envelope-comments {
  margin-top: 2rem;
  padding: 0 20px;
}

// 夜间模式适配
:global([data-theme="dark"]) {
  .formmain {
    background: #323232;
    border-color: #555;
  }

  .comments {
    background-color: #5a5a5a !important;
    border-color: #666 !important;

    div {
      color: #e0e0e0;
    }
  }

  .title3 {
    color: var(--main-color, #60a5fa);
  }

  .bottomhr {
    color: #aaa;
  }
}

// 移动端适配
@media screen and (max-width: 600px) {
  #beforeimg,
  #afterimg {
    display: none !important;
  }

  #form-wrap {
    height: auto !important;
    top: 0 !important;
  }

  #form-wrap:hover {
    height: auto !important;
    top: 0 !important;
  }

  #envelope {
    width: 100%;
    padding-top: 0;
  }

  #maincontent {
    max-width: 100%;
    padding: 0 10px;
  }

  .formmain {
    width: 100%;
  }

  .comments-main {
    padding: 0 15px 15px;
  }
}

@media screen and (min-width: 600px) {
  :deep(#article-container img) {
    margin: 0 auto 0rem;
  }
}
</style>
