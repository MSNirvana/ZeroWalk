/** 子页面 UI 组件（由 data-* 挂载点驱动） */
(function () {
  const config = window.ZeroWalk || {};

  function renderScenarioMarquee(mount) {
    const tags = config.scenarioTags;
    if (!tags?.length) return;

    const groupHtml = tags.map((label) => `<span>${label}</span>`).join("");

    mount.className = "sub-tag-marquee";
    mount.setAttribute("aria-label", "典型应用场景");
    mount.innerHTML = `
      <div class="sub-tag-marquee__track">
        <div class="sub-tag-marquee__group">${groupHtml}</div>
        <div class="sub-tag-marquee__group" aria-hidden="true">${groupHtml}</div>
      </div>
    `;
  }

  function init() {
    document.querySelectorAll("[data-scenario-marquee]").forEach(renderScenarioMarquee);
  }

  (window.ZeroWalkRunWhenReady || ((fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }))(init);
})();
