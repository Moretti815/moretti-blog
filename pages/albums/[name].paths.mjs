// 相册详情页动态路由配置
import albumData from "../../.vitepress/theme/assets/albumData.mjs";

export default {
  paths() {
    return albumData.map((album) => ({
      params: { name: album.path_name },
    }));
  },
};
