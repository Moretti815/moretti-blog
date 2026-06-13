// 装备/设备数据配置
// 参考: https://github.com/anzhiyu-c/hexo-theme-anzhiyu

export const equipmentData = [
  {
    // 分类名称
    class_name: "生产力工具",
    // 分类描述
    description: "工欲善其事，必先利其器",
    // 分类提示
    tip: "我的主力生产力设备",
    // 顶部背景图
    top_background: "https://picsum.photos/seed/equipment1/1920/600",
    // 好物列表
    good_things: [
      {
        // 分类标题
        title: "电脑设备",
        // 分类描述
        description: "日常开发和办公的主力设备",
        // 设备列表
        equipment_list: [
          {
            name: "机械革命2022极光PRO",
            specification: "i7 12700H / 32GB / 512GB",
            description: "高中时买的，本人不玩高性能游戏，所以暂时没有更换的想法。",
            image: "https://img.wkds.eu.org/link/C0dZvVcI",
            link: "https://detail.zol.com.cn/notebook/index1397786.shtml",
          },
          {
            name: "西伯利亚S21",
            specification: "2.4G TYPE-C 2.4G USB 蓝牙5.3+3.5mm",
            description: "还算可以的耳机，但是也有一些小问题，如有时一边听不见，调一下声音就好。",
            image: "https://img.wkds.eu.org/link/nKcmhj7G",
            link: "https://www.xiberia.net/h-pd-138.html",
          },
        //   {
        //     name: "Keychron Q1 Pro",
        //     specification: "红轴 / 铝坨坨",
        //     description: "主力机械键盘，手感舒适，支持蓝牙和有线双模，Mac/Win无缝切换。",
        //     image: "https://picsum.photos/seed/keyboard/400/300",
        //     link: "https://www.keychron.com",
        //   },
        //   {
        //     name: "Logitech MX Master 3S",
        //     specification: "无线鼠标",
        //     description: "人体工学设计，MagSpeed电磁滚轮，办公效率利器。",
        //     image: "https://picsum.photos/seed/mouse/400/300",
        //     link: "https://www.logitech.com",
        //   },
        ],
      },
      {
        title: "移动设备",
        description: "随身携带的移动装备",
        equipment_list: [
          {
            name: "iPhone 15 Pro",
            specification: "256GB / 钛金属",
            description: "主力手机，拍照录像都很强，日常使用体验流畅。",
            image: "https://picsum.photos/seed/iphone/400/300",
            link: "https://www.apple.com/iphone/",
          },
          {
            name: "iPad Pro 12.9",
            specification: "M2 / 256GB",
            description: "随身办公和娱乐设备，配合妙控键盘可以轻度办公。",
            image: "https://picsum.photos/seed/ipad/400/300",
            link: "https://www.apple.com/ipad/",
          },
          {
            name: "AirPods Pro 2",
            specification: "USB-C 版本",
            description: "日常通勤和办公时的降噪耳机，音质和降噪效果都很棒。",
            image: "https://picsum.photos/seed/airpods/400/300",
            link: "https://www.apple.com/airpods/",
          },
        ],
      },
    ],
  },
//   {
//     class_name: "摄影器材",
//     description: "记录生活中的美好瞬间",
//     tip: "我的摄影装备",
//     top_background: "https://picsum.photos/seed/equipment2/1920/600",
//     good_things: [
//       {
//         title: "相机镜头",
//         description: "主力拍摄设备",
//         equipment_list: [
//           {
//             name: "Sony A7M4",
//             specification: "全画幅微单",
//             description: "主力相机，3300万像素，对焦迅速，视频性能也很强。",
//             image: "https://picsum.photos/seed/sony/400/300",
//             link: "https://www.sony.com",
//           },
//           {
//             name: "Sony 24-70mm GM II",
//             specification: "F2.8 标准变焦",
//             description: "挂机镜头，画质优秀，体积控制得很好，日常拍摄首选。",
//             image: "https://picsum.photos/seed/lens1/400/300",
//             link: "https://www.sony.com",
//           },
//           {
//             name: "Sony 85mm GM",
//             specification: "F1.4 人像定焦",
//             description: "人像专用镜头，焦外柔美，光圈大，弱光环境下表现优秀。",
//             image: "https://picsum.photos/seed/lens2/400/300",
//             link: "https://www.sony.com",
//           },
//         ],
//       },
//       {
//         title: "配件",
//         description: "摄影配件和辅助设备",
//         equipment_list: [
//           {
//             name: "Peak Design 三脚架",
//             specification: "碳纤维旅行三脚架",
//             description: "轻便稳固，收纳体积小，旅行拍摄必备。",
//             image: "https://picsum.photos/seed/tripod/400/300",
//             link: "https://www.peakdesign.com",
//           },
//           {
//             name: "SD 存储卡",
//             specification: "Sony Tough 256GB",
//             description: "高速读写，防水防尘，可靠的数据存储。",
//             image: "https://picsum.photos/seed/sdcard/400/300",
//             link: "https://www.sony.com",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     class_name: "生活好物",
//     description: "提升生活品质的小物件",
//     tip: "让生活更舒适",
//     top_background: "https://picsum.photos/seed/equipment3/1920/600",
//     good_things: [
//       {
//         title: "桌面好物",
//         description: "桌面上的实用小物件",
//         equipment_list: [
//           {
//             name: "明基 ScreenBar Halo",
//             specification: "显示器挂灯",
//             description: "桌面照明神器，不占用桌面空间，光线柔和不刺眼。",
//             image: "https://picsum.photos/seed/light/400/300",
//             link: "https://www.benq.com",
//           },
//           {
//             name: "Orbi 路由器",
//             specification: "WiFi 6 Mesh",
//             description: "全屋网络覆盖，信号稳定，多设备连接无压力。",
//             image: "https://picsum.photos/seed/router/400/300",
//             link: "https://www.netgear.com",
//           },
//           {
//             name: "Herman Miller 椅子",
//             specification: "Aeron 人体工学椅",
//             description: "久坐不累，腰部支撑很好，办公必备。",
//             image: "https://picsum.photos/seed/chair/400/300",
//             link: "https://www.hermanmiller.com",
//           },
//         ],
//       },
//     ],
//   },
];

export default equipmentData;
