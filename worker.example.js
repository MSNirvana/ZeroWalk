/**
 * Cloudflare Workers 示例（复制为 worker.js 部署，勿提交真实 Webhook）
 *
 * 部署后在 Workers → Settings → Variables 添加：
 *   WECOM_WEBHOOK = https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的key
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const webhook = env.WECOM_WEBHOOK;
    if (!webhook) {
      return new Response(JSON.stringify({ errcode: -1, errmsg: "WECOM_WEBHOOK not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await request.json();
    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await resp.text();
    return new Response(result, {
      status: resp.status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  },
};
