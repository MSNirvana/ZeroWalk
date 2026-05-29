# ZeroWalk 官网

第零漫步 ZeroWalk 官方站点静态版：Canvas 互动首页 + 内容子页。

## 项目结构

```
ZeroWalk/
├── index.html                 # 首页（Canvas 动画 + 联系弹窗）
├── about.html                 # 关于我们（含客户案例）
├── services.html              # 服务内容
├── collaborate.html           # 合作方式
├── admin.html                 # 本地演示管理页（读取 localStorage）
├── assets/                    # Logo、favicon、二维码
├── styles/
│   ├── layout.css             # 字体、渐变背景、顶部导航
│   ├── home.css               # 首页 Canvas / 弹窗样式
│   └── site.css               # 子页面内容样式
└── scripts/
    ├── site-config.js         # 全站配置（导航、品牌、资源路径）
    ├── storage.js             # 线索本地存储
    ├── shared.js              # 导航与页脚渲染
    ├── home-ui.js             # 首页导航显隐、联系弹窗
    ├── home-canvas.js         # 首页 Canvas 动画
    └── admin.js               # 管理演示页
```

## 脚本加载顺序

- **子页面**：`site-config.js` → `shared.js`（管理页再加 `storage.js` → `admin.js`）
- **首页**：`site-config.js` → `storage.js` → `shared.js` → `home-ui.js` → `home-canvas.js`

## 本地运行

```bash
python3 -m http.server 8080
```

- 首页：http://localhost:8080/
- 关于我们：http://localhost:8080/about.html

## 首页交互

1. 加载后字母与 Logo 游荡，**不显示**顶部导航
2. 点击任意处汇聚品牌；汇聚完成后显示居中文字导航与「联系我们」
3. 5 秒无操作自动散开，可再次点击汇聚
4. 联系表单写入浏览器 `localStorage`，可在 `admin.html` 预览

## 部署

任意静态托管即可，将仓库根目录作为站点根路径发布。
