# ZeroWalk 官网

第零漫步 ZeroWalk 官方站点静态版：Canvas 互动首页 + 内容子页 + 注册填报流程。

## 项目结构

```
ZeroWalk/
├── index.html              # 首页（Canvas 动画 + 联系弹窗）
├── about.html              # 关于我们
├── services.html           # 服务内容
├── cases.html              # 客户案例
├── collaborate.html        # 合作方式
├── contact.html            # 联系我们
├── register.html           # 注册与信息填报
├── admin.html              # 本地演示管理页
├── assets/                 # Logo、二维码、favicon
├── styles/
│   ├── home.css            # 首页样式
│   └── site.css            # 子页面样式
└── scripts/
    ├── shared.js           # 公共导航 / 页脚
    ├── home-canvas.js      # 首页动画与交互
    ├── intake.js           # 注册表单逻辑
    └── admin.js            # 管理页逻辑
```

## 本地运行

在项目根目录执行：

```bash
python3 -m http.server 8080
```

浏览器访问：

- 首页：http://localhost:8080/
- 注册：http://localhost:8080/register.html

请将 `assets/logo-nobg.png`（透明 Logo）与 `assets/qrcode.png`（企业微信二维码）放入 `assets/` 目录。

## 首页交互说明

1. 加载后字母与 Logo 在屏幕内游荡
2. 点击任意处汇聚为品牌字样
3. 5 秒无操作自动散开，可再次点击汇聚
4. 汇聚后顶部显示子站导航，底部可打开联系弹窗

表单提交接口：`submitForm(data)`（见 `scripts/home-canvas.js`），默认 `console.log`，可对接 webhook 或后端。

## 注册页说明

- 验证码为演示流程：点击「发送验证码」后写入输入框，页面不展示明文验证码
- 提交数据保存在浏览器 `localStorage`，仅供开发演示
- 上线前需接入真实短信服务并替换联系方式

## 部署

任意静态托管即可（GitHub Pages、Cloudflare Pages、Nginx 等），将仓库根目录作为站点根路径发布。
