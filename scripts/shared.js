(function () {
  const { brand, navLinks } = window.ZeroWalk;

  function getCurrentPage() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function isHomePage() {
    const page = getCurrentPage();
    return !page || page === "index.html";
  }

  function navLinksHtml(activePage) {
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
    const page = getCurrentPage();
    mount.className = "top-nav-bar";
    mount.innerHTML = `
      <div class="top-nav-bar__inner">
        <a href="${brand.href}" class="top-nav__brand">
          <img src="${brand.logo}" alt="ZeroWalk" class="top-nav__logo" width="36" height="36" />
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

  function renderFooter() {
    const year = new Date().getFullYear();
    return `
      <footer class="footer">
        <div class="footer-inner">
          <div>© ${year} 第零漫步 ZeroWalk. 从第零步开始，走进去做。</div>
        </div>
      </footer>
    `;
  }

  function init() {
    renderSiteNav();
    const footerMount = document.querySelector("[data-shared-footer]");
    if (footerMount) footerMount.innerHTML = renderFooter();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
