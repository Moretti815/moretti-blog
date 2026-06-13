/**
 * 导航页数据
 * 每个分组包含标题、图标和一组链接项
 * icon 使用 Iconify 图标格式 (set:icon)
 */
export const guideGroups = [
  {
    title: '博客',
    icon: 'material-symbols:article-outline',
    items: [
      {
        title: '文章归档',
        desc: '按时间线浏览所有已发布的文章',
        href: '/pages/archives',
        icon: 'material-symbols:history',
      },
      {
        title: '分类',
        desc: '按主题分类查看文章',
        href: '/pages/categories',
        icon: 'material-symbols:category',
      },
      {
        title: '标签',
        desc: '通过标签快速定位感兴趣的内容',
        href: '/pages/tags',
        icon: 'material-symbols:label-outline',
      },
    ],
  },
  {
    title: '互动',
    icon: 'material-symbols:forum-outline',
    items: [
      {
        title: '友链',
        desc: '友情链接，发现更多优质博客',
        href: '/pages/link',
        icon: 'material-symbols:link',
      },
      {
        title: '留言板',
        desc: '在这里留下你的想法与建议',
        href: '/pages/message',
        icon: 'material-symbols:chat-bubble-outline',
      },
      {
        title: '朋友圈',
        desc: '友链文章聚合展示',
        href: '/pages/fcircle',
        icon: 'material-symbols:groups-outline',
      },
      {
        title: '动态',
        desc: '短文与即时分享',
        href: '/pages/moment',
        icon: 'material-symbols:dynamic-feed',
      },
    ],
  },
  {
    title: '工具',
    icon: 'material-symbols:build-circle-outline',
    items: [
      {
        title: '课程表',
        desc: '查看本学期课程安排',
        href: '/pages/timetable',
        icon: 'material-symbols:calendar-month-outline',
      },
      {
        title: '图片格式转换',
        desc: '在线转换图片格式（WebP / PNG / JPG / AVIF）',
        href: '/pages/convert',
        icon: 'material-symbols:image-outline',
      },
      {
        title: '图片水印',
        desc: '为图片添加文字或图片水印',
        href: '/pages/watermark',
        icon: 'material-symbols:brand-awareness',
      },
      {
        title: '便携小空调',
        desc: '为你的夏日带去清凉!',
        href: '/pages/air-conditioner',
        icon: 'material-symbols:ac-unit',
      },
    ],
  },
  {
    title: '关于',
    icon: 'material-symbols:info-outline',
    items: [
      {
        title: '关于我',
        desc: '了解博主的个人介绍与经历',
        href: '/pages/about',
        icon: 'material-symbols:person-outline',
      },
      {
        title: '相册',
        desc: '生活与旅途中的影像记录',
        href: '/pages/albums',
        icon: 'nrk:gallery',
      },
      {
        title: '装备',
        desc: '日常使用的软硬件装备清单',
        href: '/pages/equipment',
        icon: 'material-symbols:devices-outline',
      },
    //   {
    //     title: '项目',
    //     desc: '开源项目与作品展示',
    //     href: '/pages/project',
    //     icon: 'material-symbols:code',
    //   },
    ],
  },
  {
    title: '订阅',
    icon: 'material-symbols:rss-feed',
    items: [
      {
        title: 'RSS 订阅',
        desc: '通过邮件或 RSS 阅读器订阅本站更新',
        href: '/pages/rss',
        icon: 'material-symbols:mail-outline',
      },
    ],
  },
];
