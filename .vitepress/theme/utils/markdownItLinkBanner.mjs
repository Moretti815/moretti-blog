/**
 * markdown-it LinkBanner 链接横幅插件
 *
 * 仿 hexo 外挂标签的语法，在文章中嵌入链接横幅卡片。
 *
 * 语法：
 * ::link-banner
 * ---
 * banner: https://picsum.photos/480/240
 * title: 标题
 * description: 这是一行描述（可选，不提供则显示域名）
 * link: "#link-banner"
 * ---
 * ::
 *
 * 通过自定义 block ruler 在 block 解析阶段处理，生成静态 HTML。
 */

import { getDomain } from './linkIcons.mjs';

/** 图片镜像服务映射 */
const MIRROR_SERVICES = {
  baidu: 'https://image.baidu.com/search/down?url=',
  fly: 'https://fly.webp.se/?url=',
  weserv: 'https://wsrv.nl/?url=',
};

/**
 * 应用镜像服务转换图片 URL
 * @param {string} url 原始图片 URL
 * @param {string} service 镜像服务名称
 * @returns {string}
 */
function applyMirror(url, service) {
  if (!service || !MIRROR_SERVICES[service]) return url;
  return MIRROR_SERVICES[service] + encodeURIComponent(url);
}

/**
 * 解析 YAML 式键值对
 * @param {string} text 原始文本
 * @returns {object}
 */
function parseYamlAttrs(text) {
  const attrs = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // 跳过注释和空行
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      let value = match[2].trim();
      // 去掉首尾引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      attrs[match[1]] = value;
    }
  }
  return attrs;
}

function linkBannerPlugin(md) {
  md.block.ruler.before('fence', 'link_banner_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(pos, max);

    // 匹配 ::link-banner（至少 2 个冒号）
    const match = line.match(/^(:{2,})link-banner\s*$/);
    if (!match) return false;
    if (silent) return true;

    const marker = match[1];
    const markerLen = marker.length;

    // 查找 YAML 分隔线 ---
    let yamlStartLine = -1;
    let yamlEndLine = -1;
    for (let i = startLine + 1; i < endLine; i++) {
      const p = state.bMarks[i] + state.tShift[i];
      const m = state.eMarks[i];
      const l = state.src.slice(p, m).trim();
      if (l === '---' && yamlStartLine === -1) {
        yamlStartLine = i;
      } else if (l === '---' && yamlStartLine !== -1) {
        yamlEndLine = i;
        break;
      }
    }
    if (yamlStartLine === -1 || yamlEndLine === -1) return false;

    // 查找闭合标记 ::
    let closeLine = -1;
    for (let i = yamlEndLine + 1; i < endLine; i++) {
      const p = state.bMarks[i] + state.tShift[i];
      const m = state.eMarks[i];
      const l = state.src.slice(p, m);
      if (new RegExp(`^:{${markerLen},}\\s*$`).test(l)) {
        closeLine = i;
        break;
      }
    }
    if (closeLine === -1) return false;

    // 提取 YAML 内容并解析
    const yamlText = state.src
      .split('\n')
      .slice(yamlStartLine + 1, yamlEndLine)
      .join('\n');

    const attrs = parseYamlAttrs(yamlText);

    const banner = attrs.banner || '';
    const title = attrs.title || '';
    const description = attrs.description || '';
    const link = attrs.link || '';
    const mirror = attrs.mirror || '';

    // 构建 title 属性（与 Vue 组件 joinWith 对应）
    const titleAttr = [title, description, link].filter(Boolean).join(' - ');
    const descHtml = description
      ? md.utils.escapeHtml(description)
      : md.utils.escapeHtml(getDomain(link));

    // 生成 HTML
    let html = `<a class="link-banner s-card" href="${md.utils.escapeHtml(link)}" title="${md.utils.escapeHtml(titleAttr)}">`;

    if (banner) {
      const imgSrc = applyMirror(banner, mirror);
      html += `<img class="link-banner-bg" src="${md.utils.escapeHtml(imgSrc)}" alt="" loading="lazy" />`;
    }

    html += `<div class="link-banner-header"></div>
<div class="link-banner-info">
  <div class="link-banner-title">${md.utils.escapeHtml(title)}</div>
  <div class="link-banner-desc">${descHtml}</div>
</div>
</a>`;

    const token = state.push('html_block', '', 0);
    token.content = html + '\n';
    token.map = [startLine, closeLine + 1];

    state.line = closeLine + 1;
    return true;
  });
}

export default linkBannerPlugin;
