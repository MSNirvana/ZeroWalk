const NAV_ITEMS = [
  ["首页", "index.html"],
  ["关于我们", "about.html"],
  ["服务内容", "services.html"],
  ["合作方式", "collaborate.html"],
];

const HOME_NAV_ITEMS = NAV_ITEMS.filter(([, href]) => href !== "index.html");

function getCurrentPage() {
  const path = window.location.pathname.split("/").pop();
  return path || "index.html";
}

function renderTopNavLinks(items, activeHref) {
  return items
    .map(([label, href]) => {
      const active = activeHref === href ? " is-active" : "";
      return `<a class="top-nav__link${active}" href="${href}">${label}</a>`;
    })
    .join("");
}

function renderSiteNav() {
  const mount = document.querySelector("[data-shared-header]");
  if (!mount) return;
  const page = getCurrentPage();
  mount.innerHTML = `<nav class="top-nav" aria-label="站点导航">${renderTopNavLinks(NAV_ITEMS, page)}</nav>`;
}

function renderHomeNavTags() {
  const mount = document.getElementById("topNavTags");
  if (!mount) return;
  const page = getCurrentPage();
  mount.innerHTML = renderTopNavLinks(HOME_NAV_ITEMS, page);
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

document.addEventListener("DOMContentLoaded", () => {
  const footerMount = document.querySelector("[data-shared-footer]");

  renderSiteNav();
  renderHomeNavTags();
  if (footerMount) footerMount.innerHTML = renderFooter();
});
