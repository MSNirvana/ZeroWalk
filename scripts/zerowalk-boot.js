/**
 * 子页面脚本引导（按顺序异步加载，避免重复写一长串 script 标签）
 * 用法：<script src="/scripts/zerowalk-boot.js" data-modules="subpage-ui"></script>
 * data-modules 可选，逗号分隔，如 subpage-ui
 */
(function () {
  const extra = (document.currentScript?.dataset?.modules || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const chain = [
    "/scripts/dom-ready.js",
    "/scripts/site-config.js",
    "/scripts/storage.js",
    "/scripts/contact-form.js",
    "/scripts/contact-modal.js",
    "/scripts/shared.js",
    ...extra.map((name) => `/scripts/${name}.js`),
  ];

  function loadNext(index) {
    if (index >= chain.length) return;
    const el = document.createElement("script");
    el.src = chain[index];
    el.onload = () => loadNext(index + 1);
    el.onerror = () => console.error("[ZeroWalk] 脚本加载失败:", chain[index]);
    document.head.appendChild(el);
  }

  loadNext(0);
})();
