import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import markdownItAttrs from "markdown-it-attrs";
import container from "markdown-it-container";
import inlineSpanPlugin from "./markdownItInlineSpan.mjs";
import proseAPlugin from "./markdownItProseA.mjs";
import linkBannerPlugin from "./markdownItLinkBanner.mjs";

// markdown-it
const markdownConfig = (md, themeConfig) => {
  // 插件（顺序重要：markdown-it-attrs 先注册，确保属性注入后再执行自定义规则）
  md.use(markdownItAttrs);
  md.use(inlineSpanPlugin); // [text]{.class} 内联标签（core rule 在 inline 之后执行）
  md.use(proseAPlugin, { siteBase: themeConfig.siteMeta?.site || '' }); // ProseA 智能链接
  md.use(tabsMarkdownPlugin);
  md.use(linkBannerPlugin); // LinkBanner 链接横幅
  // timeline
  md.use(container, "timeline", {
    validate: (params) => params.trim().match(/^timeline\s+(.*)$/),
    render: (tokens, idx) => {
      const m = tokens[idx].info.trim().match(/^timeline\s+(.*)$/);
      if (tokens[idx].nesting === 1) {
        return `<div class="timeline">
                    <span class="timeline-title">${md.utils.escapeHtml(m[1])}</span>
                    <div class="timeline-content">`;
      } else {
        return "</div></div>\n";
      }
    },
  });
  // radio
  md.use(container, "radio", {
    render: (tokens, idx, _options, env) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("radio".length).trim();
      if (token.nesting === 1) {
        const isChecked = md.renderInline(check, {
          references: env.references,
        });
        return `<div class="radio">
          <div class="radio-point ${isChecked}" />`;
      } else {
        return "</div>";
      }
    },
  });
  // button
  md.use(container, "button", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("button".length).trim();
      if (token.nesting === 1) {
        return `<button class="button ${check}">`;
      } else {
        return "</button>";
      }
    },
  });
  // card
  md.use(container, "card", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="card">`;
      } else {
        return "</div>";
      }
    },
  });
  // chat - 自定义 block 规则，在 block 解析阶段处理，避免 markdown-it-attrs 干扰
  // 语法：::::chat ... :::: (4个及以上冒号)
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function processInline(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\\\n/g, '<br>')
      .replace(/\\/g, '');
  }
  function parseChat(raw) {
    const lines = raw.split('\n');
    const msgs = [];
    let cap = null, type = 'user', bodyLines = [];
    function flush() {
      if (bodyLines.length > 0) {
        msgs.push({ type, caption: cap, content: processInline(bodyLines.join('\n')) });
        bodyLines = [];
        cap = null;
      }
    }
    for (const line of lines) {
      const t = line.trim();
      if (!t) { flush(); continue; }
      const dot = t.match(/^\{\.([^}]*)\}$/);
      const sys = t.match(/^\{:(.+)\}$/);
      const usr = t.match(/^\{([^{}]+)\}$/);
      if (dot) { flush(); cap = dot[1] || null; type = 'myself'; }
      else if (sys) { flush(); msgs.push({ type: 'system', content: sys[1] }); cap = null; }
      else if (usr) { flush(); cap = usr[1]; type = 'user'; }
      else { bodyLines.push(t); }
    }
    flush();
    return msgs;
  }
  function renderChat(msgs) {
    return msgs.map(m => {
      if (m.type === 'system') return `<div class="chat-system">${esc(m.content)}</div>`;
      const c = m.caption ? `<div class="chat-caption">${esc(m.caption)}</div>` : '';
      return `<div class="chat-${m.type}">${c}<div class="chat-body">${m.content}</div></div>`;
    }).join('');
  }

  md.block.ruler.before('fence', 'chat_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);
    const match = line.match(/^(:{4,})chat\s*$/);
    if (!match) return false;
    if (silent) return true;

    const marker = match[1];
    const markerLen = marker.length;

    // 查找闭合标记
    let closeLine = -1;
    for (let i = startLine + 1; i < endLine; i++) {
      const p = state.bMarks[i] + state.tShift[i];
      const m = state.eMarks[i];
      const l = state.src.slice(p, m);
      if (new RegExp(`^:{${markerLen},}\\s*$`).test(l)) {
        closeLine = i;
        break;
      }
    }
    if (closeLine === -1) return false;

    // 提取原始文本
    const rawText = state.src
      .split('\n')
      .slice(startLine + 1, closeLine)
      .join('\n')
      .trim();

    // 解析并渲染
    const messages = parseChat(rawText);
    const html = `<div class="chat-wrap">${renderChat(messages)}</div>`;

    const token = state.push('html_block', '', 0);
    token.content = html + '\n';
    token.map = [startLine, closeLine + 1];

    state.line = closeLine + 1;
    return true;
  });
  // 表格
  md.renderer.rules.table_open = () => {
    return '<div class="table-container"><table>';
  };
  md.renderer.rules.table_close = () => {
    return "</table></div>";
  };
  // 图片
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content;
    // 检查是否有自定义 class（由 markdown-it-attrs 注入，如 {.icon}）
    const classIdx = token.attrIndex("class");
    const customClass = classIdx !== -1 ? token.attrs[classIdx][1] : "";

    // 带有自定义 class 的图片：原样渲染，不包裹 fancybox
    if (customClass) {
      return `<img class="${customClass}" src="${src}" alt="${alt}" loading="lazy" />`;
    }
    if (!themeConfig.fancybox.enable) {
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    }
    return `<a class="img-fancybox" href="${src}" data-fancybox="gallery" data-caption="${alt}">
                <img class="post-img" src="${src}" alt="${alt}" loading="lazy" />
                <span class="post-img-tip">${alt}</span>
              </a>`;
  };
  
  // obsidian admonition
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const lang = token.info.trim();

    // 处理 Obsidian admonition
    if (lang.startsWith('ad-')) {
      const type = lang.substring(3); // 取ad-之后的内容，获取类型
      const content = token.content;

      const admonitionTypes = {
        'note': 'info',
        'question': 'info',
        'warning': 'warning',
        'tip': 'tip',
        'summary': 'info',
        'hint': 'tip',
        'important': 'warning',
        'caution': 'warning',
        'error': 'danger',
        'danger': 'danger'
      };

      const className = admonitionTypes[type] || 'info';
      const title = type.toUpperCase();

      return `<div class="${className} custom-block">
            <p class="custom-block-title">${title}</p>
            <div class="custom-block-content">
              ${md.render(content)}
            </div>
    </div>`;
    }
    return fence(...args);
  };  
};

export default markdownConfig;
