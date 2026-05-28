const NAV_ITEMS = [
  ["首页", "index.html"],
  ["关于我们", "about.html"],
  ["服务内容", "services.html"],
  ["客户案例", "cases.html"],
  ["合作方式", "collaborate.html"],
  ["联系我们", "contact.html"],
  ["注册/登录", "register.html"],
];

const HOME_NAV_ITEMS = NAV_ITEMS.filter(([, href]) => href !== "index.html");

function renderHomeNavTags() {
  const mount = document.getElementById("topNavTags");
  if (!mount) return;
  mount.innerHTML = HOME_NAV_ITEMS.map(
    ([label, href]) => `<a href="${href}">${label}</a>`,
  ).join("");
}

function getCurrentPage() {
  const path = window.location.pathname.split("/").pop();
  return path || "index.html";
}

function renderHeader() {
  const page = getCurrentPage();
  const nav = NAV_ITEMS.map(([label, href]) => {
    const active = page === href ? "active" : "";
    return `<a class="${active}" href="${href}">${label}</a>`;
  }).join("");

  return `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="index.html" aria-label="ZeroWalk Home">
          <div class="brand-mark" aria-hidden="true">零</div>
          <div class="brand-text">
            <strong>第零漫步 ZeroWalk</strong>
            <span>Walk in from zero</span>
          </div>
        </a>
        <nav class="nav" aria-label="Main navigation">${nav}</nav>
      </div>
    </header>
  `;
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
  const headerMount = document.querySelector("[data-shared-header]");
  const footerMount = document.querySelector("[data-shared-footer]");

  if (headerMount) headerMount.innerHTML = renderHeader();
  if (footerMount) footerMount.innerHTML = renderFooter();
  renderHomeNavTags();
});
