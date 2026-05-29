/** 全站导航与页脚（依赖 site-config.js） */
(function () {
  const config = window.ZeroWalk || {};
  const { brand, navLinks } = config;

  function getCurrentPage() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function isHomePage() {
    const page = getCurrentPage();
    return !page || page === "index.html";
  }

  function navLinksHtml(activePage) {
    if (!navLinks?.length) return "";
    return navLinks
      .map(({ label, href }) => {
        const active = activePage === href ? " is-active" : "";
        return `<a href="${href}"${active}>${label}</a>`;
      })
      .join("");
  }

  function renderHomeNav(mount) {
    mount.className = "top-nav top-nav--home";
    mount.innerHTML = navLinks
      .map(({ label, href }) => `<a href="${href}">${label}</a>`)
      .join("");
  }

  function renderSubNav(mount) {
    if (!brand) return;

    const page = getCurrentPage();
    mount.className = "top-nav-bar";
    mount.innerHTML = `
      <div class="top-nav-bar__inner">
        <a href="${brand.href}" class="top-nav__brand">
          <picture class="top-nav__logo-wrap">
            <source srcset="${brand.logo}" type="image/gif" media="(prefers-reduced-motion: no-preference)" />
            <img src="${brand.logoStatic || brand.logo}" alt="" class="top-nav__logo" width="47" height="36" decoding="async" />
          </picture>
          <span class="top-nav__brand-text">${brand.label}</span>
        </a>
        <nav class="top-nav__links" aria-label="页面导航">${navLinksHtml(page)}</nav>
      </div>
    `;
  }

  function renderSiteNav() {
    const mount = document.getElementById("topNavTags");
    if (!mount) return;
    if (isHomePage()) renderHomeNav(mount);
    else renderSubNav(mount);
  }

  function renderFooterHtml() {
    const year = new Date().getFullYear();
    return `
      <footer class="footer">
        <p class="footer-manifesto">工作流  ·  自动化  ·  Agent  ·  被 AI 放大的业务能力</p>
        <div class="footer-inner">
          <div>© ${year} 第零漫步 ZeroWalk. 从第零步开始，走进去做。</div>
        </div>
      </footer>
    `;
  }

  function init() {
    renderSiteNav();
    const footerMount = document.querySelector("[data-shared-footer]");
    if (footerMount) footerMount.innerHTML = renderFooterHtml();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
