// 相册数据配置
// 参考: https://github.com/anzhiyu-c/hexo-theme-anzhiyu

export const albumData = [
  {
    // 相册分类名称
    class_name: "风景摄影",
    // 相册描述
    description: "记录旅途中的美好风景",
    // 相册封面
    cover: "https://picsum.photos/seed/album1/800/1200",
    // 相册路径名（用于路由）
    path_name: "landscape",
    // 顶部背景图（可选）
    top_background: "",
    // 相册列表
    album_list: [
      {
        // 文字内容
        content: "这是我在海边拍摄的一张照片，日落时分的景色非常美丽。",
        // 图片列表
        image: [
          "https://picsum.photos/seed/landscape1/800/600",
          "https://picsum.photos/seed/landscape2/800/600",
        ],
        // 日期
        date: "2024-06-15",
        // 地点
        address: "青岛",
        // 来源
        from: "iPhone 15 Pro",
        // 链接（可选）
        link: "",
        // 音乐（可选）
        // aplayer: {
        //   id: "123456",
        //   server: "netease",
        // },
      },
      {
        content: "山间云雾缭绕，宛如仙境。",
        image: [
          "https://picsum.photos/seed/landscape3/800/600",
        ],
        date: "2024-05-20",
        address: "黄山",
        from: "Sony A7M4",
      },
    ],
  },
  {
    class_name: "美食日记",
    description: "记录生活中的美食瞬间",
    cover: "https://picsum.photos/seed/album2/800/1200",
    path_name: "food",
    album_list: [
      {
        content: "这家店的拉面真的超级好吃！",
        image: [
          "https://picsum.photos/seed/food1/800/600",
          "https://picsum.photos/seed/food2/800/600",
          "https://picsum.photos/seed/food3/800/600",
        ],
        date: "2024-06-10",
        address: "东京",
        from: "iPhone 15 Pro",
      },
    ],
  },
  {
    class_name: "日常生活",
    description: "平凡生活中的小确幸",
    cover: "https://picsum.photos/seed/album3/800/1200",
    path_name: "daily",
    album_list: [
      {
        content: "今天天气真好，适合出去走走。",
        image: [
          "https://picsum.photos/seed/daily1/800/600",
          "https://picsum.photos/seed/daily2/800/600",
        ],
        date: "2024-06-01",
        address: "上海",
        from: "日常",
      },
    ],
  },
  {
    class_name: "宠物相册",
    description: "我家毛孩子的可爱瞬间",
    cover: "https://picsum.photos/seed/album4/800/1200",
    path_name: "pets",
    album_list: [
      {
        content: "今天也是元气满满的一天！",
        image: [
          "https://picsum.photos/seed/pet1/800/600",
          "https://picsum.photos/seed/pet2/800/600",
        ],
        date: "2024-05-15",
        address: "家中",
        from: "宠物",
      },
    ],
  },
];

export default albumData;
