<template>
  <div ref="commentRef" id="comment-dom" :class="['comment-content', 'twikoo', { fill }]" />
</template>

<script setup>
import { jumpRedirect } from "@/utils/commonTools";
import initComments from "@/utils/initComments";

const props = defineProps({
  // 填充评论区
  fill: {
    type: [Boolean, String],
    default: false,
  },
});

const { theme } = useData();
const { comment } = theme.value;

// 评论数据
const twikoo = ref(null);
const commentRef = ref(null);

// 初始化 Twikoo
const initTwikoo = async () => {
  try {
    await nextTick();
    const Twikoo = await initComments(theme.value);
    twikoo.value = Twikoo.init({
      el: commentRef.value || "#comment-dom",
      envId: comment.twikoo.envId,
      onCommentLoaded: () => {
        console.log("评论已加载完毕");
        if (props.fill) fillComments(props.fill);
        // 检查是否有来自装备页面的评论需要填充
        checkEquipmentComment();
        jumpRedirect(null, theme.value, true);
      },
    });
    return twikoo.value;
  } catch (error) {
    console.error("初始化评论出错：", error);
  }
};

// 填充评论区
const fillComments = (data) => {
  console.log("填充评论：", data);
  // 获取评论元素
  const commentDom = document.querySelector(".tk-input.el-textarea");
  if (!commentDom) return false;
  // 获取输入框
  const commentInput = commentDom.querySelector("textarea");
  // 写入内容
  commentInput.value = data + "\n\n";
  commentInput.focus();
};

// 检查并填充来自装备页面的评论
const checkEquipmentComment = () => {
  const content = sessionStorage.getItem('equipment-comment');
  if (content) {
    // 尝试多种选择器查找输入框
    const selectors = [
      '.tk-input textarea',
      '.tk-input .el-textarea__inner',
      'textarea.tk-textarea',
      '.el-textarea__inner',
      '.twikoo .el-textarea textarea'
    ];

    for (const selector of selectors) {
      const commentInput = document.querySelector(selector);
      if (commentInput) {
        commentInput.value = content + '\n\n';
        commentInput.focus();
        // 触发 input 事件
        commentInput.dispatchEvent(new Event('input', { bubbles: true }));
        sessionStorage.removeItem('equipment-comment');
        console.log('已填充装备评论:', content);
        return true;
      }
    }
  }
  return false;
};

onMounted(() => {
  initTwikoo();
});
</script>


<style>
.el-textarea__inner {
    font-family: var(--main-font-family);
}
</style>