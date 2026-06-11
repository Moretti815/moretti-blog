/**
 * markdown-it ProseA 智能链接插件
 * 
 * 功能：
 *  - 外部链接自动在新标签页打开
 *  - 根据域名自动匹配 Iconify 图标（可由 {icon="..."} 覆盖）
 *  - 鼠标悬停显示域名 tooltip
 *  - 外部链接显示 ↗ 指示器
 * 
 * 语法：
 *  [文字](https://github.com)              → 自动匹配 GitHub 图标
 *  [文字](https://xxx.com){icon="ri:xxx"}  → 自定义 Iconify 图标
 * 
 * 注意：需在 markdown-it-attrs 之后注册，以便读取 {icon="..."} 属性。
 */

import { getLinkIcon, getDomain, isExternalLink } from './linkIcons.mjs';

function proseAPlugin(md, options = {}) {
  const siteBase = options.siteBase || '';

  // 保存原始 link_open / link_close 渲染器
  const defaultLinkOpen = md.renderer.rules.link_open ||
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  const defaultLinkClose = md.renderer.rules.link_close ||
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));

  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const hrefIdx = token.attrIndex('href');
    if (hrefIdx === -1) return defaultLinkOpen(tokens, idx, opts, env, self);

    const href = token.attrs[hrefIdx][1];

    // 读取 icon 属性（由 markdown-it-attrs 注入）
    const iconAttrIdx = token.attrIndex('icon');
    let iconName = iconAttrIdx !== -1 ? token.attrs[iconAttrIdx][1] : null;

    // 如果是自定义 icon 属性，从 attrs 中移除（不输出到 HTML）
    if (iconAttrIdx !== -1) {
      token.attrs.splice(iconAttrIdx, 1);
    }

    // 自动匹配域名图标（仅外部链接）
    const isExternal = isExternalLink(href, siteBase);
    if (!iconName && isExternal) {
      iconName = getLinkIcon(href);
    }

    // 构建链接属性
    let attrs = '';

    // 外部链接：新标签页打开 + 安全属性
    if (isExternal) {
      attrs += ' target="_blank" rel="noopener noreferrer"';
    }

    // Tooltip：悬停显示域名或完整 URL
    const domain = getDomain(href);
    const tooltip = domain || href;
    attrs += ` title="${md.utils.escapeHtml(tooltip)}"`;

    // 图标 HTML
    let iconHtml = '';
    if (iconName) {
      iconHtml = `<span class="iconify link-icon" data-icon="${md.utils.escapeHtml(iconName)}" aria-hidden="true"></span>`;
    }

    // 外部链接指示器（无自定义图标时）
    let extIndicator = '';
    if (isExternal && !iconName) {
      extIndicator = '<span class="ext-indicator" aria-hidden="true"></span>';
    }

    // 添加 class
    const existingClassIdx = token.attrIndex('class');
    const existingClass = existingClassIdx !== -1 ? token.attrs[existingClassIdx][1] : '';
    const newClass = existingClass ? `${existingClass} prose-a` : 'prose-a';

    if (existingClassIdx !== -1) {
      token.attrs[existingClassIdx][1] = newClass;
    } else {
      token.attrPush(['class', newClass]);
    }

    // 渲染原始链接标签 + 图标/指示器
    const baseHtml = defaultLinkOpen(tokens, idx, opts, env, self);
    return `${baseHtml}${iconHtml}${extIndicator}`;
  };
}

export default proseAPlugin;
