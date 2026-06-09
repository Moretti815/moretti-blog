/**
 * add-sponsor.mjs
 * 从 GitHub Issue body 中解析赞助数据，追加到 sponsors.json 末尾
 *
 * 用法：node add-sponsor.mjs "<issue_body_file>"
 *   issue_body_file - 存放 issue body 的临时文件路径
 */

import fs from 'node:fs';
import path from 'node:path';

const SPONSORS_PATH = path.resolve('public/sponsors.json');

/** 从 issue body 提取指定字段的值 */
function getField(body, label) {
  const re = new RegExp(`### ${label}\\n+([\\s\\S]*?)(?=\\n### |\\s*$)`);
  const m = body.match(re);
  if (!m) return '';
  const v = m[1].trim();
  if (!v || v === '_No response_') return '';
  return v;
}

// ─── main ────────────────────────────────────────────────────
const [bodyFile] = process.argv.slice(2);

if (!bodyFile) {
  console.error('用法: node add-sponsor.mjs <body_file>');
  process.exit(1);
}

const issueBody = fs.readFileSync(bodyFile, 'utf8');

// 1. 解析字段
const name   = getField(issueBody, '赞助人名称');
const avatar = getField(issueBody, '头像链接');
const date   = getField(issueBody, '赞助日期');
const amount = getField(issueBody, '赞助金额');

if (!name || !date || !amount) {
  console.error('错误：赞助人名称、赞助日期和赞助金额为必填项');
  process.exit(1);
}

console.log(`解析完成: ${name} | ${date} | ${amount}`);

// 2. 读取现有数据
const sponsors = JSON.parse(fs.readFileSync(SPONSORS_PATH, 'utf8'));

// 3. 追加新条目
sponsors.push({
  name,
  avatar: avatar || null,
  date,
  amount,
});

// 4. 写回文件（保留 2 空格缩进 + 尾部换行）
fs.writeFileSync(SPONSORS_PATH, JSON.stringify(sponsors, null, 2) + '\n');
console.log(`SUCCESS: 已将 "${name}" 添加到 sponsors.json（当前共 ${sponsors.length} 条）`);
