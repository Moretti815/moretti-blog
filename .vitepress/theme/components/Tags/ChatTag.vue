<!-- ChatTag 聊天标签组件：解析 :::chat 容器渲染后的 HTML 并转换为聊天界面 -->
<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useData } from 'vitepress';

const { page } = useData();

/** 去除 HTML 标签并解码实体 */
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** HTML 转义 */
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 解析 .chat-wrap 内渲染后的 HTML 为消息数组 */
function parseChatWrap(wrapper) {
  const messages = [];
  let caption = null;
  let type = 'user';

  for (const child of wrapper.children) {
    if (child.tagName === 'HR') continue;
    if (child.tagName !== 'P') continue;

    const text = stripHtml(child.innerHTML);

    const dotMatch = text.match(/^\{\.([^}]*)\}$/);
    const sysMatch = text.match(/^\{:(.+)\}$/);
    const userMatch = text.match(/^\{([^{}]+)\}$/);

    if (dotMatch) {
      caption = dotMatch[1] || null;
      type = 'myself';
    } else if (sysMatch) {
      messages.push({ type: 'system', content: sysMatch[1] });
      caption = null;
    } else if (userMatch) {
      caption = userMatch[1];
      type = 'user';
    } else {
      // 消息体：使用原始渲染后的 HTML（保留 bold、italic、code 等格式）
      messages.push({ type, caption, content: child.innerHTML });
      caption = null;
    }
  }

  return messages;
}

/** 将消息数组渲染为 HTML */
function renderMessages(msgs) {
  return msgs
    .map((m) => {
      if (m.type === 'system') {
        return `<div class="chat-system">${esc(m.content)}</div>`;
      }
      const cap = m.caption
        ? `<div class="chat-caption">${esc(m.caption)}</div>`
        : '';
      return `<div class="chat-${m.type}">${cap}<div class="chat-body">${m.content}</div></div>`;
    })
    .join('');
}

/** 处理页面中所有未处理的 .chat-wrap 元素 */
function processAll() {
  document.querySelectorAll('.chat-wrap:not([data-chat-done])').forEach((el) => {
    const messages = parseChatWrap(el);
    el.innerHTML = renderMessages(messages);
    el.dataset.chatDone = 'true';
  });
}

onMounted(processAll);

// SPA 导航时重新处理
watch(() => page.value.relativePath, () => {
  requestAnimationFrame(processAll);
});
</script>

<template>
  <slot />
</template>

<style lang="scss">
.chat-wrap {
  margin: 1.5em 0;
  font-size: 0.9em;
}

// 系统消息（居中）
.chat-system {
  text-align: center;
  font-size: 0.82em;
  color: var(--main-font-second-color);
  padding: 0.5em 0;
}

// 名称标签
.chat-caption {
  font-size: 0.82em;
  color: var(--main-font-second-color);
  margin-bottom: 0.15em;
  padding: 0 0.4em;
}

// 消息气泡通用样式
.chat-body {
  width: fit-content;
  max-width: 75%;
  padding: 0.55em 1em;
  border-radius: 1em;
  line-height: 1.5;
  word-break: break-word;

  p {
    margin: 0;
  }

  br {
    display: block;
    content: "";
    margin-top: 0.15em;
  }

  strong,
  em {
    color: inherit;
  }

  code {
    background: rgba(127, 127, 127, 0.15);
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-size: 0.9em;
    color: inherit;
  }
}

// 他人消息（左对齐）
.chat-user {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .chat-body {
    background: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    border-start-start-radius: 0.25em;
  }
}

// 自己消息（右对齐）
.chat-myself {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .chat-body {
    background: var(--main-color);
    color: #fff;
    border-start-end-radius: 0.25em;
  }
}
</style>
