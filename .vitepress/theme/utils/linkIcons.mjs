/**
 * 链接域名图标映射
 * 用于 ProseA 智能链接：根据链接域名自动匹配 Iconify 图标
 */

/** 专门域名图标映射（优先级高于主域名） */
const domainIcons = {
  'developer.mozilla.org': 'simple-icons:mdnwebdocs',
  'mp.weixin.qq.com': 'ri:wechat-fill',
};

/** 主域名图标映射 */
const mainDomainIcons = {
  'bilibili.com': 'ri:bilibili-fill',
  'creativecommons.org': 'ri:creative-commons-line',
  'feishu.cn': 'icon-park-outline:new-lark',
  'github.com': 'ri:github-fill',
  'github.io': 'ri:github-fill',
  'google.cn': 'ri:google-fill',
  'google.com': 'ri:google-fill',
  'jd.com': 'simple-icons:jd',
  'larkoffice.com': 'icon-park-outline:new-lark',
  'microsoft.com': 'ri:microsoft-fill',
  'netlify.app': 'simple-icons:netlify',
  'pages.dev': 'simple-icons:cloudflare',
  'qq.com': 'ri:qq-fill',
  'taobao.com': 'ri:taobao-fill',
  'tmall.com': 'ri:taobao-fill',
  'v2ex.com': 'simple-icons:v2ex',
  'vercel.app': 'simple-icons:vercel',
  'zhihu.com': 'ri:zhihu-line',
};

/**
 * 从 URL 提取域名
 * @param {string} url
 * @returns {string}
 */
export function getDomain(url) {
  try {
    return new URL(url, 'https://placeholder.local').hostname;
  } catch {
    return '';
  }
}

/**
 * 提取主域名（去掉子域名前缀）
 * @param {string} url
 * @returns {string}
 */
export function getMainDomain(url) {
  const domain = getDomain(url);
  if (!domain) return '';
  const parts = domain.split('.');
  // 保留最后两段（如 github.com、bilibili.com）
  return parts.length >= 2 ? parts.slice(-2).join('.') : domain;
}

/**
 * 根据 URL 获取对应的 Iconify 图标名
 * @param {string} url
 * @returns {string|null} 图标名或 null
 */
export function getLinkIcon(url) {
  const domain = getDomain(url);
  const mainDomain = getMainDomain(url);
  // 优先匹配专门域名
  if (domain in domainIcons) return domainIcons[domain];
  // 再匹配主域名
  if (mainDomain in mainDomainIcons) return mainDomainIcons[mainDomain];
  return null;
}

/**
 * 判断是否为外部链接
 * @param {string} url
 * @param {string} [siteBase=""]
 * @returns {boolean}
 */
export function isExternalLink(url, siteBase = '') {
  if (!url) return false;
  if (url.startsWith('#') || url.startsWith('/') || url.startsWith('mailto:')) return false;
  if (/^https?:\/\//.test(url)) {
    try {
      const linkHost = new URL(url).hostname;
      const baseHost = siteBase ? new URL(siteBase).hostname : '';
      return linkHost !== baseHost;
    } catch {
      return true;
    }
  }
  return false;
}
