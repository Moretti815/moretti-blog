// 主题配置
export const themeConfig = {
  // 站点信息
  siteMeta: {
    // 站点标题
    title: "Moretti's Blog",
    // 站点描述
    description: "人生如逆旅，我亦是行人。",
    // 站点logo
    logo: "https://agi.alicdn.com/user/769lz/06729553-fde6-4d7a-94ed-25be45434b8d_icon.jpeg",
    // 站点地址
    site: "https://b.2005815.xyz",
    // 语言
    lang: "zh-CN",
    // 作者
    author: {
      name: "Moretti815",
      cover: "https://agi.alicdn.com/user/769lz/06729553-fde6-4d7a-94ed-25be45434b8d_icon.jpeg",
      email: "mcy@kemiaosw.top",
      link: "https://b.2005815.xyz",
    },
  },
  // 备案信息
  icp: "",
  // 建站日期
  since: "2024-11-01",
  // 每页文章数据
  postSize: 8,
  // inject
  inject: {
    // 头部
    // https://vitepress.dev/zh/reference/site-config#head
    header: [
      // Onion-Location
      [
        "meta",
        {
          "http-equiv": "Onion-Location",
          content: "chiyubknkdlzx4mjmiuu64sqaez2rxj3ae2weypybpkxpodpx3etsiqd.onion",
        },
      ],
      // favicon
      ["link", { rel: "icon", href: "/favicon.ico" }],
      // 提前标记 JS 可用，便于 no-js 场景做纯 CSS 降级
      ["script", {}, "document.documentElement.classList.add('js-enabled');"],
      // RSS
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS",
          href: "#",
        },
      ],
            // iconfont
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn2.codesign.qq.com/icons/g5ZpEgx3z4VO6j2/latest/iconfont.css",
        },
      ],
      // iconify
      [
        "script",
        {
          src: "https://code.iconify.design/3/3.1.0/iconify.min.js",
          defer: true,
        },
      ],
      // Embed code
    //   ["link", { rel: "preconnect", href: "https://use.sevencdn.com" }],
    //   ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    //   [
    //     "link",
    //     {
    //       crossorigin: "anonymous",
    //       href: "https://use.sevencdn.com/css2?family=Fira+Code:wght@300..700&display=swap",
    //       rel: "stylesheet",
    //     },
    //   ],
    //   // 预载 DocSearch
    //   [
    //     "link",
    //     {
    //       href: "https://0F1DUC8MAX-dsn.algolia.net",
    //       rel: "preconnect",
    //       crossorigin: "",
    //     },
    //   ],
      // Umami 统计
      [
        "script",
        {
          defer: true,
          src: "https://um.2005815.xyz/script.js",
          "data-website-id": "f8fb9e7a-9d44-49c1-96f7-98ac672eb88f",
        },
      ],
      // Code font and Algolia connections are loaded lazily only when needed.
    ],
  },

  // 导航栏菜单
  nav: [
    {
      text: "文库",
      items: [
        { text: "文章列表", link: "/pages/archives", icon: "article" },
        { text: "全部分类", link: "/pages/categories", icon: "folder" },
        { text: "全部标签", link: "/pages/tags", icon: "hashtag" },
      ],
    },
    {
      text: "页面导航",
      items: [
        { text: "导航", link: "/pages/guide", icon: "iconoir:navigator" },
        // { text: "技术分享", link: "/pages/categories/技术分享", icon: "technical" },
        // { text: "我的项目", link: "/pages/project", icon: "code" },
        // { text: "效率工具", link: "/pages/tools", icon: "tools" },
      ],
    },
    {
      text: "友链",
      items: [
        { text: "友链鱼塘", link: "/pages/fcircle", icon: "fish" },
        { text: "友情链接", link: "/pages/link", icon: "people" },
      ],
    },
    {
      text: "我的",
      items: [
        { text: "畅所欲言", link: "/pages/message", icon: "chat" },
        { text: "致谢名单", link: "/pages/reward", icon: "reward" },
        { text: "关于本站", link: "/pages/about", icon: "contacts" },
      ],
    },
  ],
  // 导航栏菜单 - 左侧
  navMore: [
    {
      name: "项目",
      list: [
        {
          icon: "tabler:home",
          name: "主页",
          url: "https://home.2005815.xyz",
        },
        // {
        //   icon: "/images/logo/other/hot.png",
        //   name: "热榜",
        //   url: "https://hot.chiyu.it",
        // },
        // {
        //   icon: "/images/logo/other/nav.png",
        //   name: "Nav",
        //   url: "https://nav.chiyu.it",
        // },
      ],
    },
    {
      name: "服务",
      list: [
        {
          icon: "/images/uptime-favicon.ico",
          name: "检测",
          url: "https://status.2005815.xyz/",
        },
        // {
        //   icon: "/images/logo/logo.webp",
        //   name: "镜像站",
        //   url: "https://backup.chiyu.it",
        // },
      ],
    },
    //  {
    //   name: "项目",
    //   list: [
    //     {
    //       icon: "/images/logo/logo.webp",
    //       name: "占位符",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  // 封面配置
  cover: {
    // 是否开启双栏布局
    twoColumns: false,
    // 是否开启封面显示
    showCover: {
      // 是否开启封面显示 文章不设置cover封面会显示异常，可以设置下方默认封面
      enable: true,
      // 封面布局方式: left | right | both
      coverLayout: "both",
      // 默认封面
      // 支持两种格式：
      //   1. 单个 URL 字符串：自动拼接 ?seed= 参数，每篇文章显示不同随机封面
      //      如 "https://img.2005815.xyz/h" → "https://img.2005815.xyz/h?seed=12345"
      //   2. 数组：按文章索引取模轮流展示
      //      如 ["url1", "url2", "url3"]
      defaultCover: "https://img.2005815.xyz/h",
    },
  },
  // 页脚信息
  footer: {
    // 社交链接（请确保为偶数个）
    social: [
      {
        icon: "email",
        link: "https://s.2005815.xyz/mail",
      },
      {
        icon: "github",
        link: "https://s.2005815.xyz/github",
      },
      {
        icon: "telegram",
        link: "https://s.2005815.xyz/telegram",
      },
      {
        icon: "bilibili",
        link: "https://s.2005815.xyz/bilibili",
      },
      {
        icon: "qq",
        link: "https://s.2005815.xyz/qq",
      },
    ],
    // sitemap
    sitemap: [
      {
        text: "博客",
        items: [
 
          { text: "全部分类", link: "/pages/categories" },
          { text: "全部标签", link: "/pages/tags" },
          { text: "文章归档", link: "/pages/archives", newTab: true },
        ],
      },
      {
        text: "项目",
        items: [
          {
            text: "本站源码",
            link: "https://github.com/moretti815/moretti-blog",
            newTab: true,
          },
        ],
      },
      //{
      //text: "专栏",
      //items: [
      //{ text: "技术分享", link: "/pages/categories/技术分享" },
      //{ text: "我的项目", link: "/pages/project" },
      // { text: "效率工具", link: "/pages/tools" },
      // ],
      // },
      {
        text: "页面",
        items: [
          //{ text: "畅所欲言", link: "/pages/message" },
          { text: "关于本站", link: "/pages/about" },
          { text: "隐私政策", link: "/pages/privacy" },
          { text: "版权协议", link: "/pages/cc" },
          { text: "TODO", link: "/pages/todo" },
        ],
      },
      {
        text: "服务",
        items: [{ text: "站点状态", link: "https://status.2005815.xyz", newTab: true }],
      },
    ],
    // 页脚徽标
    badges: {
      // 是否显示底部徽标区域
      enable: true,
      // 标题文本
      title: "Made with ❤️",
      // 徽标列表
      items: [
        { icon: "📡", text: "IPv6已启用", show: true },
        { icon: "⚡️", text: "HTTP/3", show: true },
        { icon: "🧅", text: ".onion可用", show: false },
        { icon: "🌱", text: "低碳环保", show: true },
        { icon: "🍪", text: "无Cookie", show: false },
        { icon: "🕵️", text: "无追踪", show: true },
      ],
    },
  },
  // 评论
  comment: {
    enable: true,
    // 评论系统选择
    // artalk / twikoo
    type: "twikoo",
    // artalk
    // https://artalk.js.org/
    artalk: {
      site: "",
      server: "",
    },
    // twikoo
    // https://twikoo.js.org/
    twikoo: {
      // 必填，若不想使用 CDN，可以使用 pnpm add twikoo 安装并引入
      js: "https://cdn.jsdelivr.net/npm/twikoo@1.7.11/dist/twikoo.all.min.js",
      envId: "https://twikoo-curve.2005815.xyz",
      // 环境地域，默认为 ap-shanghai，腾讯云环境填 ap-shanghai 或 ap-guangzhou；Vercel 环境不填
      region: "",
      lang: "zh-CN",
    },
  },
  // 侧边栏
  aside: {
    // 站点简介
    hello: {
      enable: true,
      text: "欢迎来到Moretti的博客！我在这个博客中记录着我的<b>生活日常</b>、<b>踩坑过程</b>和<b>资源分享</b>。<br>希望你可以在这里获得开心~",
    },
    // 目录
    toc: {
      enable: true,
    },
    // 标签
    tags: {
      enable: true,
    },
    // 倒计时
    countDown: {
      enable: true,
      // 倒计时日期
      data: {
        name: "生日",
        date: "2005-08-15",
      },
    },
    timing: {
      enable: false,
      items: [
        {
          icon: "💌",
          name: "池鱼",
          event: "活着",
          date: "2010-09-07",
        },
        {
          icon: "💊",
          event: "HRT",
          date: "2025-03-24",
        },
      ],
    },
    // 站点数据
    siteData: {
      enable: true,
    },
    // 天气数据
    weather: {
      enable: true,
    },
    HelloGithub: {
      enable: true,
    },
  },
  // 友链
  friends: {
    // 友链朋友圈
    circleOfFriends: "https://fc.2005815.xyz/",
    // 动态友链
    dynamicLink: {
      server: "",
      app_token: "",
      table_id: "",
    },
  },
  // 音乐播放器
  // https://github.com/imsyy/Meting-API
  music: {
    enable: false,
    // url
    url: "https://meting.20100907.xyz/api",
    // id
    id: 13470307260,
    // netease / tencent / kugou
    server: "netease",
    // playlist / album / song
    type: "playlist",
  },
  // 搜索
  // https://www.algolia.com/
  search: {
    enable: true,
    appId: "FNL358TX5Y",
    apiKey: "7e04fff0970f2b1b323742dcc29ffb03",
    indexName: "blog",
  },
  // 天气 Key
  // 请前往 高德开放平台注册 Web服务 Key
  // 请注意不是 Web端 (JS API)，免费申请，每日上限 5000 次
  // 此处提供的服务可能会超量从而无法访问，请自行申请！请自行申请！请自行申请！
  // 若此处设为空则调用 教书先生 API https://api.oioweb.cn/doc/weather/GetWeather
  //weatherkey: {
  //"key": "1d65cc630df1f212e1d2e928643e3974",
  // },
  // 打赏
  rewardData: {
    enable: true,
    // 微信二维码
    wechat: "/reward/weixin.avif",
    // 支付宝二维码
    alipay: "/reward/alipay.avif",
  },
  // 图片灯箱
  fancybox: {
    enable: true,
    js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
    css: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css",
  },
  // 外链中转
  jumpRedirect: {
    enable: false,
    // 排除类名
    exclude: [
      "cf-friends-link",
      "upyun",
      "icp",
      "author",
      "rss",
      "cc",
      "power",
      "social-link",
      "link-text",
      "travellings",
      "post-link",
      "report",
      "more-link",
      "skills-item",
      "right-menu-link",
      "link-card",
    ],
  },
  // 站点统计
  tongji: {
    "51la": "3M1I52LMkdPIgpya",
  },
  // 说说页面配置
  moment: {
    // 默认展示的数据源: memos / jike / tgtalk / mastodon
    defaultTab: "mastodon",
    // 数据源 Tab 配置（控制显示/隐藏）
    tabs: [
      { key: "memos", enable: true },
      { key: "jike", enable: false },
      { key: "tgtalk", enable: true },
      { key: "mastodon", enable: true },
    ],
    // Mastodon 配置
    mastodon: {
      // API 地址
      apiUrl: "https://mastodon-api.20050815.xyz/",
    },
  },
  // 说说滚动条配置
  momentTicker: {
    // 是否启用
    enable: true,
    // 数据源: memos / jike / tgtalk / mastodon
    source: "mastodon",
    // 显示数量
    limit: 5,
  },
  // 信封留言板配置
  // https://github.com/Akilarlxh/hexo-butterfly-envelope
  envelope: {
    // 是否启用
    enable: true,
    // 信笺头部图片
    cover: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/violet.jpg",
    // 信笺底部图片
    line: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/line.png",
    // 信封前半部分
    beforeimg: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/before.png",
    // 信封后半部分
    afterimg: "https://npm.elemecdn.com/hexo-butterfly-envelope/lib/after.png",
    // 信笺正文，多行文本
    message: [
      "有什么想问的？",
      "有什么想说的？",
      "有什么想吐槽的？",
      "哪怕是有什么想吃的，都可以告诉我哦~",
    ],
    // 底部文本，仅支持单行
    bottom: "自动书记人偶竭诚为您服务！",
    // 信封划出的高度，默认1024px
    height: "1024px",
  },
  // 相册配置
  // 参考: https://github.com/anzhiyu-c/hexo-theme-anzhiyu
  album: {
    // 是否启用
    enable: true,
    // 相册列表页面顶部背景图
    topBackground: "",
    // 相册标题
    title: "这里是我的相册集哦😯",
    // 相册描述
    description: "每一张照片都是一次美好的记忆。",
  },
};
