/**
 * markdown-it 自定义内联标签插件
 * 语法1：[文本内容]{.class-name}  →  <span class="class-name">文本内容</span>
 * 语法2：:blur[文本内容]  →  <span class="blur-text">文本内容</span>
 * 语法3：:key{code="Escape" ctrl shift}  →  <kbd class="key-tag" data-code="Escape">Esc</kbd>
 *
 * 通过 core rule 在 inline token 的 children 中匹配文本模式，
 * 替换为 html_inline tokens。
 */

const BRACKET_RE = /\[([^\]]+)\]\{\.([a-zA-Z0-9_-]+(?:\s+[a-zA-Z0-9_-]+)*)\}/;
const BLUR_RE = /:blur\[([^\]]+)\]/;
const KEY_RE = /:key\{([^}]+)\}/;

// 按键显示名称映射
const KEY_DISPLAY = {
  ' ': 'Space', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑',
  Control: 'Ctrl', Delete: 'Del', Escape: 'Esc', Meta: 'Win',
};
// 按键图标符号映射
const KEY_SYMBOL = {
  ' ': '␣', Alt: '⌥', Backspace: '⌫', Control: '⌃', Delete: '⌦',
  Enter: '↵', Escape: '⎋', Meta: '⊞', Shift: '⇧', Tab: '⇥', Win: '⊞',
};

/** 解析 :key{...} 的属性字符串 */
function parseKeyAttrs(raw) {
  const attrs = { code: '', text: '', icon: false, ctrl: false, shift: false, alt: false, meta: false, cmd: false };
  const re = /(\w+)="([^"]*)"|(\w+)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m[1]) {
      // key="value"
      if (m[1] === 'code') attrs.code = m[2];
      else if (m[1] === 'text') attrs.text = m[2];
    } else if (m[3]) {
      // boolean flag
      const flag = m[3];
      if (flag in attrs) attrs[flag] = true;
    }
  }
  return attrs;
}

/** 获取按键显示文本 */
function getKeyDisplay(attrs) {
  if (attrs.text) return attrs.text;
  const useIcon = attrs.icon;
  const parts = [];
  function display(code) {
    if (useIcon && code in KEY_SYMBOL) return KEY_SYMBOL[code];
    return KEY_DISPLAY[code] || code;
  }
  if (attrs.cmd) parts.push(display('Control'));
  if (attrs.ctrl && !attrs.cmd) parts.push(display('Control'));
  if (attrs.shift) parts.push(display('Shift'));
  if (attrs.alt) parts.push(display('Alt'));
  if (attrs.meta && !attrs.cmd) parts.push(display('Meta'));
  if (attrs.code) parts.push(display(attrs.code));
  return parts.join(useIcon ? '' : '+');
}

function inlineSpanPlugin(md) {
  md.core.ruler.after("inline", "inline_span_class", (state) => {
    const blockTokens = state.tokens;

    for (let i = 0; i < blockTokens.length; i++) {
      if (blockTokens[i].type !== "inline") continue;
      const children = blockTokens[i].children;
      if (!children) continue;

      const newChildren = [];

      for (const token of children) {
        // 仅处理纯文本 token
        if (token.type !== "text" || !BRACKET_RE.test(token.content)) {
          newChildren.push(token);
          continue;
        }

        const parts = token.content.split(BRACKET_RE);
        // parts: [前缀, 文本, class, 后缀, ...]
        for (let j = 0; j < parts.length; j++) {
          if (j % 3 === 0) {
            // 普通文本段
            if (parts[j]) {
              const t = new state.Token("text", "", 0);
              t.content = parts[j];
              newChildren.push(t);
            }
          } else if (j % 3 === 1) {
            // 匹配组的文本部分（下一个 parts[j+1] 是 class）
            const textContent = parts[j];
            const className = parts[j + 1];
            j++; // 跳过 class 部分

            // 开标签 <span class="...">
            const open = new state.Token("html_inline", "", 0);
            open.content = `<span class="${md.utils.escapeHtml(className)}">`;
            newChildren.push(open);

            // 内部文本（递归解析内联 markdown）
            const inlineTokens = [];
            md.inline.parse(textContent, state.md, state.env, inlineTokens);
            newChildren.push(...inlineTokens);

            // 闭标签 </span>
            const close = new state.Token("html_inline", "", 0);
            close.content = "</span>";
            newChildren.push(close);
          }
          // j % 3 === 2 是 class 部分，已在 j++ 中跳过
        }
      }

      blockTokens[i].children = newChildren;
    }
  });

  // :blur[text] → <span class="blur-text">text</span>
  md.core.ruler.after("inline", "inline_blur_tag", (state) => {
    const blockTokens = state.tokens;

    for (let i = 0; i < blockTokens.length; i++) {
      if (blockTokens[i].type !== "inline") continue;
      const children = blockTokens[i].children;
      if (!children) continue;

      const newChildren = [];

      for (const token of children) {
        if (token.type !== "text" || !BLUR_RE.test(token.content)) {
          newChildren.push(token);
          continue;
        }

        const parts = token.content.split(BLUR_RE);
        // parts: [前缀, 文本, 后缀, ...]
        for (let j = 0; j < parts.length; j++) {
          if (j % 2 === 0) {
            if (parts[j]) {
              const t = new state.Token("text", "", 0);
              t.content = parts[j];
              newChildren.push(t);
            }
          } else {
            const textContent = parts[j];

            const open = new state.Token("html_inline", "", 0);
            open.content = '<span class="blur-text">';
            newChildren.push(open);

            const inlineTokens = [];
            md.inline.parse(textContent, state.md, state.env, inlineTokens);
            newChildren.push(...inlineTokens);

            const close = new state.Token("html_inline", "", 0);
            close.content = "</span>";
            newChildren.push(close);
          }
        }
      }

      blockTokens[i].children = newChildren;
    }
  });

  // :key{attrs} → <kbd class="key-tag">Display</kbd>（纯 HTML，无 Vue 组件）
  md.core.ruler.after("inline", "inline_key_tag", (state) => {
    const blockTokens = state.tokens;

    for (let i = 0; i < blockTokens.length; i++) {
      if (blockTokens[i].type !== "inline") continue;
      const children = blockTokens[i].children;
      if (!children) continue;

      const newChildren = [];

      for (const token of children) {
        if (token.type !== "text" || !KEY_RE.test(token.content)) {
          newChildren.push(token);
          continue;
        }

        const parts = token.content.split(KEY_RE);
        for (let j = 0; j < parts.length; j++) {
          if (j % 2 === 0) {
            if (parts[j]) {
              const t = new state.Token("text", "", 0);
              t.content = parts[j];
              newChildren.push(t);
            }
          } else {
            const attrs = parseKeyAttrs(parts[j].trim());
            const display = getKeyDisplay(attrs);
            const dataCode = attrs.code ? ` data-code="${md.utils.escapeHtml(attrs.code)}"` : '';
            const tag = new state.Token("html_inline", "", 0);
            tag.content = `<kbd class="key-tag"${dataCode}>${md.utils.escapeHtml(display)}</kbd>`;
            newChildren.push(tag);
          }
        }
      }

      blockTokens[i].children = newChildren;
    }
  });
}

export default inlineSpanPlugin;
