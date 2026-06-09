/**
 * add-friend.mjs
 * 从 GitHub Issue body 中解析友链数据，插入到 linkData.mjs 指定分组末尾
 *
 * 用法：node add-friend.mjs "<issue_body_file>" "<group_name>" "<labels_json>"
 *   issue_body_file - 存放 issue body 的临时文件路径
 *   group_name      - 目标分组 type（如 neighbour）
 *   labels_json     - issue labels 的 JSON 字符串（如 '["推荐","设计"]'）
 */

import fs from 'node:fs';
import path from 'node:path';

const LINK_DATA_PATH = path.resolve('.vitepress/theme/assets/linkData.mjs');

/** 从 issue body 提取指定字段的值 */
function getField(body, label) {
  const re = new RegExp(`### ${label}\\n+([\\s\\S]*?)(?=\\n### |\\s*$)`);
  const m = body.match(re);
  if (!m) return '';
  const v = m[1].trim();
  if (!v || v === '_No response_') return '';
  return v;
}

/** 在文件行数组中，从 startIdx 向后找到匹配行的索引 */
function findLineIndex(lines, pattern, startIdx = 0) {
  for (let i = startIdx; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i;
  }
  return -1;
}

// ─── main ────────────────────────────────────────────────────
const [bodyFile, groupName, labelsJson] = process.argv.slice(2);

if (!bodyFile || !groupName) {
  console.error('用法: node add-friend.mjs <body_file> <group_name> [labels_json]');
  process.exit(1);
}

const issueBody = fs.readFileSync(bodyFile, 'utf8');
const labels = labelsJson ? JSON.parse(labelsJson) : [];

// 1. 解析字段
const name     = getField(issueBody, '站点名称');
const url      = getField(issueBody, '站点地址');
const avatar   = getField(issueBody, '头像链接');
const snapshot = getField(issueBody, '站点截图');
const desc     = getField(issueBody, '站点描述');
const feed     = getField(issueBody, 'RSS 订阅地址');
const links    = getField(issueBody, '友链页面地址');
const tags     = labels.join(',');

if (!name || !url) {
  console.error('错误：站点名称和站点地址为必填项');
  process.exit(1);
}

console.log(`解析完成: ${name} (${url})  分组: ${groupName}  标签: ${tags}`);

// 2. 读取 linkData.mjs
let content = fs.readFileSync(LINK_DATA_PATH, 'utf8');
const lines = content.split('\n');

// 3. 找到目标分组所在行
const groupIdx = findLineIndex(lines, new RegExp(`type:\\s*["']${groupName}["']`));
if (groupIdx === -1) {
  console.error(`GROUP_NOT_FOUND:${groupName}`);
  process.exit(2);  // 退出码 2 表示分组不存在
}

// 4. 从分组开始，找到 typeList: [ 所在行
const typeListStart = findLineIndex(lines, /typeList:\s*\[/, groupIdx);
if (typeListStart === -1) {
  console.error(`错误：分组 "${groupName}" 中未找到 typeList`);
  process.exit(1);
}

// 5. 找到 typeList 的闭合行 "    ],"（4空格缩进）
let typeListEnd = -1;
for (let i = typeListStart + 1; i < lines.length; i++) {
  if (/^ {4}\],?\s*$/.test(lines[i])) {
    typeListEnd = i;
    break;
  }
}
if (typeListEnd === -1) {
  console.error('错误：无法定位 typeList 结束位置');
  process.exit(1);
}

// 6. 构造新条目（6空格缩进，与现有条目一致）
const esc = (s) => (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const entryLines = [
  '      {',
  `        name: "${esc(name)}",`,
  `        url: "${esc(url)}",`,
  `        avatar: "${esc(avatar)}",`,
  `        snapshot: "${esc(snapshot)}",`,
  `        desc: "${esc(desc)}",`,
  feed ? `        feed: "${esc(feed)}",` : null,
  `        tags: "${esc(tags)}",`,
  `        links: "${esc(links)}",`,
  '      },',
].filter(Boolean);

// 7. 在 typeList 闭合行前插入
lines.splice(typeListEnd, 0, ...entryLines);

// 8. 写回文件
fs.writeFileSync(LINK_DATA_PATH, lines.join('\n'));
console.log(`SUCCESS:group:${groupName}`);
console.log(`已将 "${name}" 添加到分组 "${groupName}"`);
