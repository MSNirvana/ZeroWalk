/** 全站共享配置（导航、品牌、存储键） */
window.ZeroWalk = {
  brand: {
    label: "第零漫步",
    href: "/",
    logo: "/assets/logo-anim.gif",
    logoStatic: "/assets/logo-nav.png",
  },
  navLinks: [
    { label: "关于我们", href: "/about" },
    { label: "服务内容", href: "/services" },
    { label: "合作方式", href: "/collaborate" },
  ],
  scenarioTags: [
    "商品文案批量生成",
    "客服自动回复",
    "竞品数据监控",
    "销售跟进话术",
    "报价自动生成",
    "客户画像分析",
    "选题方案生成",
    "脚本自动创作",
    "发布计划排期",
    "会议纪要自动化",
    "周报日报生成",
    "简历批量筛选",
    "经销商健康评分",
    "招商线索评级",
    "政策自动触达",
  ],
  storageKey: "zerowalk_intake_records",
  /** Cloudflare Workers 域名（见 worker.example.js） */
  wecomProxyUrl: "https://zerowalk-contact.gg1178078309.workers.dev",
  contactForm: {
    issueOptions: [
      "不知道从哪里开始用 AI",
      "有具体场景，需要人帮我做出来",
      "已有工具，但没效果或没人用",
      "想了解合作或加盟方式",
      "其他",
    ],
  },
  home: {
    logoSrc: "/assets/logo-nobg.png",
    logoFallback: "/assets/logo-black.png",
    qrSrc: "/assets/qrcode.png",
  },
};
