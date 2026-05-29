# ZeroWalk 官网

第零漫步 ZeroWalk 官方站点静态版：Canvas 互动首页 + IBM 式内容子页。

## 项目结构

```
ZeroWalk/
├── index.html              # 首页（Canvas + 联系弹窗）
├── about.html              # 关于我们（含客户案例）
├── services.html           # 服务内容（含场景标签轮播）
├── collaborate.html        # 合作方式
├── admin.html              # 本地演示管理页（localStorage）
├── assets/
│   ├── logo-anim.gif       # 子页导航 Logo 动画
│   └── logo-nav.png        # 减少动效时的静态 Logo
├── styles/
│   ├── layout.css          # 字体、渐变背景、顶栏导航
│   ├── home.css            # 首页（import layout）
│   ├── subpages.css        # 子页 IBM 式排版与组件
│   └── site.css            # 子页通用样式（import layout + subpages）
└── scripts/
    ├── site-config.js      # 全站配置（品牌、导航、场景标签、资源路径）
    ├── shared.js           # 导航与页脚渲染
    ├── subpage-ui.js       # 子页可复用 UI（data-* 挂载）
    ├── storage.js          # 线索本地存储
    ├── home-ui.js          # 首页导航与联系弹窗
    ├── home-canvas.js      # 首页 Canvas 动画
    ├── admin.js            # 管理演示页
    └── build-logo-gif.py   # 从 Logo.mov 生成导航 GIF（可选）
```

## 脚本分层

| 层级 | 文件 | 职责 |
|------|------|------|
| 配置 | `site-config.js` | `window.ZeroWalk`：品牌、导航、场景标签、存储键 |
| 壳层 | `shared.js` | `#topNavTags`、`[data-shared-footer]` |
| 子页 UI | `subpage-ui.js` | `[data-scenario-marquee]` 等挂载点 |
| 首页 | `home-ui.js`、`home-canvas.js` | 汇聚交互与 Canvas |
| 数据 | `storage.js`、`admin.js` | 表单与演示后台 |

## 脚本加载顺序

- **子页面**：`site-config.js` → `shared.js`（`services.html` 另加 `subpage-ui.js`）
- **首页**：`site-config.js` → `storage.js` → `shared.js` → `home-ui.js` → `home-canvas.js`
- **管理页**：`site-config.js` → `storage.js` → `shared.js` → `admin.js`

## 本地运行

```bash
python3 -m http.server 8080
```

- 首页：http://localhost:8080/
- 关于我们：http://localhost:8080/about.html

## 首页交互

1. 加载后字母与 Logo 游荡，顶部显示「关于我们 / 服务内容 / 合作方式」
2. 点击任意处汇聚品牌；完成后显示「联系我们」与文案区
3. 汇聚后保持布局，不再自动散开
4. 联系表单写入 `localStorage`，可在 `admin.html` 预览

## 部署

任意静态托管即可，将仓库根目录作为站点根路径发布。
