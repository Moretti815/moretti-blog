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
  // pic - 图片展示标签，语法：::pic ... ::
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function parsePicYaml(raw) {
    const lines = raw.split('\n').filter(l => {
      const t = l.trim();
      return t && !t.startsWith('#');
    });
    const attrs = { zoom: true, mirror: '' };
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (!key) continue;
      if (key === 'zoom') attrs.zoom = val !== 'false';
      else if (key === 'mirror') attrs.mirror = val;
      else attrs[key] = val;
    }
    return attrs;
  }
  function renderPic(attrs) {
    let src = attrs.src || '';
    if (!src) return '';
    // mirror：通过第三方图片加载服务
    if (attrs.mirror) {
      src = attrs.mirror.replace(/\{url\}/g, encodeURIComponent(src)) || src;
    }
    const style = [];
    if (attrs.width) style.push(`max-width:${attrs.width}`);
    if (attrs.height) style.push(`max-height:${attrs.height}`);
    const styleAttr = style.length ? ` style="${style.join(';')}"` : '';
    const caption = attrs.caption ? `<span class="pic-caption">${esc(attrs.caption)}</span>` : '';
    const imgHtml = `<img class="pic-img" src="${esc(src)}" alt="${esc(attrs.caption || '')}" loading="lazy"${styleAttr} />`;
    if (attrs.zoom !== false && themeConfig?.fancybox?.enable !== false) {
      return `<div class="pic-wrapper"><a class="img-fancybox" href="${esc(src)}" data-fancybox="gallery" data-caption="${esc(attrs.caption || '')}">${imgHtml}</a>${caption}</div>`;
    }
    return `<div class="pic-wrapper">${imgHtml}${caption}</div>`;
  }

  md.block.ruler.before('fence', 'pic_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);
    const match = line.match(/^(:{2,})pic\s*$/);
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

    // 提取原始文本（跳过去 --- 和末尾 ---）
    const rawLines = state.src.split('\n').slice(startLine + 1, closeLine);
    // 找到 --- 分隔符，提取中间的 YAML
    let yamlStart = -1, yamlEnd = -1;
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].trim() === '---') {
        if (yamlStart === -1) yamlStart = i;
        else { yamlEnd = i; break; }
      }
    }
    let yamlRaw = '';
    if (yamlStart !== -1 && yamlEnd !== -1) {
      yamlRaw = rawLines.slice(yamlStart + 1, yamlEnd).join('\n');
    } else {
      // 没有 --- 分隔符，直接用全部内容
      yamlRaw = rawLines.join('\n');
    }

    const attrs = parsePicYaml(yamlRaw);
    const html = renderPic(attrs);
    const token = state.push('html_block', '', 0);
    token.content = html + '\n';
    token.map = [startLine, closeLine + 1];
    state.line = closeLine + 1;
    return true;
  });
  // poetry - 诗词展示标签，语法：::poetry ... ::
  function parsePoetryYaml(raw) {
    const lines = raw.split('\n').filter(l => {
      const t = l.trim();
      return t && !t.startsWith('#');
    });
    const attrs = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      if (key) attrs[key] = val;
    }
    return attrs;
  }
  function renderPoetry(meta, bodyLines) {
    let html = '<div class="poetry-wrapper">';
    if (meta.title) html += `<div class="poetry-title">${esc(meta.title)}</div>`;
    if (meta.author) html += `<div class="poetry-author">${esc(meta.author)}</div>`;
    html += '<div class="poetry-body">';
    for (const line of bodyLines) {
      if (line.trim()) {
        html += `<p>${md.renderInline(line)}</p>`;
      } else {
        html += '<p class="poetry-empty">&nbsp;</p>';
      }
    }
    html += '</div>';
    if (meta.footer) html += `<div class="poetry-footer">${esc(meta.footer)}</div>`;
    html += '</div>';
    return html;
  }

  md.block.ruler.before('fence', 'poetry_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);
    const match = line.match(/^(:{2,})poetry\s*$/);
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
    const rawLines = state.src.split('\n').slice(startLine + 1, closeLine);
    // 找到 --- 分隔符，提取 YAML 和正文
    let yamlStart = -1, yamlEnd = -1;
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].trim() === '---') {
        if (yamlStart === -1) yamlStart = i;
        else { yamlEnd = i; break; }
      }
    }
    let meta = {};
    let bodyLines = [];
    if (yamlStart !== -1 && yamlEnd !== -1) {
      meta = parsePoetryYaml(rawLines.slice(yamlStart + 1, yamlEnd).join('\n'));
      bodyLines = rawLines.slice(yamlEnd + 1);
    } else {
      // 没有 --- 分隔符，全部作为正文
      bodyLines = rawLines;
    }
    // 去除正文首尾空行
    while (bodyLines.length && !bodyLines[0].trim()) bodyLines.shift();
    while (bodyLines.length && !bodyLines[bodyLines.length - 1].trim()) bodyLines.pop();

    const html = renderPoetry(meta, bodyLines);
    const token = state.push('html_block', '', 0);
    token.content = html + '\n';
    token.map = [startLine, closeLine + 1];
    state.line = closeLine + 1;
    return true;
  });
  // quote - 引用展示标签，语法：::quote{icon="..."} ... :: 或 ::quote ... #icon ... #default ... ::
  function parseQuoteContent(rawLines) {
    let iconProp = null;   // icon prop 值
    let iconSlot = null;    // #icon 段内容
    let bodyLines = [];     // #default / 正文内容
    let inIcon = false;
    let inDefault = false;
    let hasSlotSyntax = false;
    for (const line of rawLines) {
      const t = line.trim();
      if (t === '#icon') { hasSlotSyntax = true; inIcon = true; inDefault = false; continue; }
      if (t === '#default') { inIcon = false; inDefault = true; continue; }
      if (inIcon) { iconSlot = (iconSlot || '') + t; }
      else if (inDefault) { bodyLines.push(line); }
      else { bodyLines.push(line); }
    }
    return { iconProp, iconSlot, bodyLines, hasSlotSyntax };
  }
  function renderQuoteBlock(icon, iconText, bodyLines) {
    let html = '<div class="quote-block">';
    html += '<div class="quote-icon-line">';
    if (iconText) {
      html += `<span class="quote-icon-text">${esc(iconText)}</span>`;
    } else {
      const iconName = icon || 'tabler:message-2';
      html += `<span class="iconify" data-icon="${esc(iconName)}" aria-hidden="true"></span>`;
    }
    html += '</div>';
    html += '<div class="quote-content">';
    for (const line of bodyLines) {
      if (line.trim()) {
        html += `<p>${md.renderInline(line)}</p>`;
      }
    }
    html += '</div></div>';
    return html;
  }

  md.block.ruler.before('fence', 'quote_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);
    // 匹配 ::quote 或 ::quote{icon="..."}
    const match = line.match(/^(:{2,})quote(?:\{([^}]*)\})?\s*$/);
    if (!match) return false;
    if (silent) return true;

    const marker = match[1];
    const markerLen = marker.length;
    const attrStr = match[2] || '';

    // 解析 {icon="..."} 属性
    let iconProp = null;
    const iconMatch = attrStr.match(/icon="([^"]*)"/);
    if (iconMatch) iconProp = iconMatch[1];

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

    // 提取原始文本（闭合标记之前的所有行）
    const rawLines = state.src.split('\n').slice(startLine + 1, closeLine);
    // 去除首尾空行
    while (rawLines.length && !rawLines[0].trim()) rawLines.shift();
    while (rawLines.length && !rawLines[rawLines.length - 1].trim()) rawLines.pop();

    const { iconSlot, bodyLines } = parseQuoteContent(rawLines);
    // 决定图标：icon slot > icon prop > 默认
    const finalIcon = iconSlot ? null : (iconProp || 'tabler:message-2');
    const finalIconText = iconSlot || null;
    const html = renderQuoteBlock(finalIcon, finalIconText, bodyLines);

    const token = state.push('html_block', '', 0);
    token.content = html + '\n';
    token.map = [startLine, closeLine + 1];
    state.line = closeLine + 1;
    return true;
  });
  // chat - 自定义 block 规则，在 block 解析阶段处理，避免 markdown-it-attrs 干扰
  // 语法：::::chat ... :::: (4个及以上冒号)
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
