/**
 * Cloudflare Workers：将官网询盘转发至企业微信群机器人（解决浏览器跨域）
 *
 * 【部署步骤】
 * 1. Cloudflare 控制台 → Workers & Pages → 创建 Worker
 * 2. 将本文件内容粘贴并部署，复制 Workers 域名
 * 3. 在 scripts/site-config.js 的 wecomProxyUrl 填入该域名
 *
 * 【企业微信机器人】
 * 1. 新建群「ZeroWalk 官网询盘」→ 群机器人 → 添加机器人
 * 2. 复制 Webhook，将 key 填入下方 WECOM_WEBHOOK
 */

const WECOM_WEBHOOK =
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=37c633a6-ce01-4280-9d69-2ec2a1b183a0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const body = await request.json();
    const resp = await fetch(WECOM_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await resp.text();
    return new Response(result, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  },
};
