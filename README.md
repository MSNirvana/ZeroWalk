# ZeroWalk 官网

第零漫步 ZeroWalk 官方站点静态版：Canvas 互动首页 + 内容子页。

## 项目结构

```
ZeroWalk/
├── index.html              # 首页（Canvas 动画）
├── about.html              # 关于我们（含客户案例）
├── services.html           # 服务内容
├── collaborate.html        # 合作方式
├── admin.html              # 本地演示管理页（可选）
├── assets/                 # Logo、favicon
├── styles/
│   ├── brand.css           # 全站渐变背景 + 顶部导航
│   ├── home.css            # 首页样式
│   └── site.css            # 子页面样式
└── scripts/
    ├── shared.js           # 公共导航 / 页脚
    ├── home-canvas.js      # 首页动画与交互
    ├── intake.js           # 注册表单逻辑（已下线页面，脚本保留供参考）
    └── admin.js            # 管理页逻辑
```

## 本地运行

```bash
python3 -m http.server 8080
```

- 首页：http://localhost:8080/
- 关于我们：http://localhost:8080/about.html

请将 `assets/logo-nobg.png` 放入 `assets/` 目录。

## 站点导航

全站顶部为**纯文字导航**（无背景胶囊），首页游荡阶段亦始终显示：

首页 · 关于我们 · 服务内容 · 合作方式

## 部署

任意静态托管即可，将仓库根目录作为站点根路径发布。
