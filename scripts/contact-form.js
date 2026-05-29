/**
 * 首页联系弹窗：企业微信推送
 *
 * 【第一步：创建企业微信群机器人】
 * 1. 在企业微信新建群，命名为「ZeroWalk 官网询盘」
 * 2. 群设置 → 群机器人 → 添加机器人 → 新建机器人
 * 3. 命名为「官网询盘助手」→ 添加完成
 * 4. 复制 Webhook 地址，格式为：
 *    https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx
 * 5. 在 Cloudflare Workers 环境变量添加 WECOM_WEBHOOK（完整 Webhook URL，勿提交到 Git）
 *
 * 【第二步：部署 Cloudflare Workers】
 * 1. 注册 Cloudflare 账号（免费）→ Workers & Pages → 创建应用
 * 2. 将 worker.example.js 复制为线上 Worker，配置环境变量 WECOM_WEBHOOK
 * 3. 保存并部署 → 复制 Workers 域名
 * 4. 将域名填入 scripts/site-config.js 的 wecomProxyUrl
 *
 * 【推送到群里的消息格式预览】
 * 📥 新询盘 · ZeroWalk 官网
 * 姓名：张三
 * 联系方式：138xxxxxxxx
 * 公司 / 业务：跨境电商团队
 * 问题类型：有具体场景，需要人帮我做出来
 * 补充说明：主要想优化商品文案和客服回复
 * 提交时间：2026-05-29 16:45
 * 来源页面：https://zerowalk.com/index.html
 */
(function () {
  const PLACEHOLDER_PROXY = "https://your-worker.your-subdomain.workers.dev";

  function getProxyUrl() {
    const url = window.ZeroWalk?.wecomProxyUrl || "";
    if (!url || url === PLACEHOLDER_PROXY) return null;
    return url.replace(/\/$/, "");
  }

  function formatSubmitTime() {
    return new Date().toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function submitForm(data) {
    const proxyUrl = getProxyUrl();
    if (!proxyUrl) {
      console.warn(
        "[ZeroWalk] 未配置 wecomProxyUrl，跳过企业微信推送。请在 site-config.js 填入 Cloudflare Workers 地址。",
      );
      return false;
    }

    const now = formatSubmitTime();
    const payload = {
      msgtype: "markdown",
      markdown: {
        content: [
          "## 📥 新询盘 · ZeroWalk 官网",
          `**姓名：** ${data.name}`,
          `**联系方式：** ${data.contact}`,
          `**公司 / 业务：** ${data.company}`,
          `**问题类型：** ${data.issue}`,
          `**补充说明：** ${data.note || "无"}`,
          `**提交时间：** ${now}`,
          `**来源页面：** ${window.location.href}`,
        ].join("\n"),
      },
    };

    try {
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (err) {
      console.error("[ZeroWalk] 企业微信推送失败", err);
      return false;
    }
  }

  window.ZeroWalkContactForm = { submitForm, getProxyUrl };
})();
