/**
 * 生成 friend.json 文件
 * 用于 Friend-Circle-Lite 友链朋友圈
 * 从 linkData.mjs 读取友链数据，转换为指定格式
 * 格式: [name, url, links, avatar]
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 linkData.mjs 文件
const linkDataPath = join(__dirname, "../.vitepress/theme/assets/linkData.mjs");
const outputPath = join(__dirname, "../public/friend.json");

// 黑名单（可选）
const blacklist = [];

try {
  // 读取并解析 linkData.mjs
  const fileContent = readFileSync(linkDataPath, "utf-8");

  // 提取数组部分（处理 export default）
  const arrayMatch = fileContent.match(/const linkData = (\[[\s\S]*?\]);/);
  if (!arrayMatch) {
    throw new Error("无法解析 linkData 数组");
  }

  // 使用 eval 解析数组（注意：仅用于本地脚本）
  const linkData = eval(arrayMatch[1]);

  // 提取所有友链
  let friends = [];

  linkData.forEach((entry) => {
    if (entry.typeList && Array.isArray(entry.typeList)) {
      // 过滤黑名单
      const filteredList = entry.typeList.filter((linkItem) => !blacklist.includes(linkItem.name));

      // 转换为 [name, url, links, avatar] 格式
      filteredList.forEach((item) => {
        friends.push([
          item.name,
          item.url,
          item.links || "", // 友链页面链接
          item.avatar,
        ]);
      });
    }
  });

  // 构建 JSON 数据
  const friendData = {
    friends: friends,
  };

  // 写入 friend.json 文件
  const friendJSON = JSON.stringify(friendData, null, 2);
  writeFileSync(outputPath, friendJSON, "utf-8");

  console.log(`✅ friend.json 文件已生成，共 ${friends.length} 个友链`);
  console.log(`📁 输出路径: ${outputPath}`);

  // 打印友链列表
  console.log("\n友链列表:");
  friends.forEach((friend, index) => {
    console.log(`  ${index + 1}. ${friend[0]}`);
    console.log(`     站点: ${friend[1]}`);
    console.log(`     友链页: ${friend[2] || "未设置"}`);
    console.log(`     头像: ${friend[3]}`);
  });
} catch (error) {
  console.error("❌ 生成 friend.json 失败:", error.message);
  process.exit(1);
}
