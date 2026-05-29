/**
 * 子页面精简引导（仅导航 + 页脚，无联系弹窗）
 * 用法：<script src="/scripts/zerowalk-boot-min.js"></script>
 */
(function () {
  const chain = ["/scripts/dom-ready.js", "/scripts/site-config.js", "/scripts/shared.js"];

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
