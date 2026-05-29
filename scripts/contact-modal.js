/** 全站联系弹窗：挂载 DOM、打开/关闭、表单提交、CTA 触发 */
(function () {
  const config = window.ZeroWalk || {};
  const qrSrc = config.home?.qrSrc || "/assets/qrcode.png";
  const defaultIssueOptions = [
    "不知道从哪里开始用 AI",
    "有具体场景，需要人帮我做出来",
    "已有工具，但没效果或没人用",
    "想了解合作或加盟方式",
    "其他",
  ];

  let els = {};
  let successCloseTimer = null;
  let bound = false;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function issueSelectHtml() {
    const options = config.contactForm?.issueOptions || defaultIssueOptions;
    const items = options
      .map((label) => `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`)
      .join("");
    return `<select id="fieldIssue" name="issue" required>
              <option value="" disabled selected>请选择最符合的描述</option>
              ${items}
            </select>`;
  }

  function modalTemplate() {
    return `
      <div id="modalOverlay" class="modal-overlay" aria-hidden="true"></div>
      <div
        id="modalCard"
        class="modal-card"
        role="dialog"
        aria-labelledby="modalQrTitle"
        aria-modal="true"
        aria-hidden="true"
      >
        <button type="button" class="modal-close" id="modalClose" aria-label="关闭">×</button>
        <div id="modalMain">
          <div class="modal-qr-block">
            <p class="modal-qr__title" id="modalQrTitle">扫码添加，优先响应</p>
            <img class="modal-qr__img" src="${qrSrc}" alt="企业微信二维码" width="120" height="120" />
            <p class="modal-qr__hint">扫描添加企业微信，通常 2 小时内回复</p>
          </div>
          <div class="modal-split" aria-hidden="true">
            <span class="modal-split__line"></span>
            <span class="modal-split__text">或留下信息，我们主动联系</span>
            <span class="modal-split__line"></span>
          </div>
          <form id="contactForm" class="modal-form" novalidate>
            <label for="fieldName">姓名</label>
            <input id="fieldName" type="text" name="name" placeholder="您的姓名" required autocomplete="name" />
            <label for="fieldContact">手机号 / 微信号</label>
            <input id="fieldContact" type="text" name="contact" placeholder="填写其中一个即可" required autocomplete="tel" />
            <label for="fieldCompany">公司 / 业务</label>
            <input id="fieldCompany" type="text" name="company" placeholder="例：跨境电商团队 / 护肤品代理品牌" required />
            <label for="fieldIssue">最想解决的问题</label>
            ${issueSelectHtml()}
            <label for="fieldNote">补充说明 <span class="modal-form__optional">（选填）</span></label>
            <textarea id="fieldNote" name="note" placeholder="可描述您的业务规模、具体问题等，方便我们提前了解" rows="2"></textarea>
            <button type="submit" class="modal-form__submit" id="formSubmit">提交</button>
          </form>
        </div>
        <div id="modalSuccess" class="modal-success" hidden>
          <div class="modal-success__icon" aria-hidden="true">✓</div>
          <p class="modal-success__title">已收到您的信息</p>
          <p class="modal-success__desc">
            我们将在 1 个工作日内主动联系您。<br />
            如有急需，可直接扫描上方二维码添加企业微信。
          </p>
        </div>
      </div>
    `;
  }

  function cacheElements() {
    els = {
      overlay: document.getElementById("modalOverlay"),
      card: document.getElementById("modalCard"),
      close: document.getElementById("modalClose"),
      main: document.getElementById("modalMain"),
      success: document.getElementById("modalSuccess"),
      form: document.getElementById("contactForm"),
      submit: document.getElementById("formSubmit"),
    };
  }

  function ensureMounted() {
    if (document.getElementById("modalCard")) {
      cacheElements();
      return;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = modalTemplate();
    while (wrap.firstChild) {
      document.body.appendChild(wrap.firstChild);
    }
    cacheElements();
  }

  function clearSuccessTimer() {
    if (successCloseTimer) {
      clearTimeout(successCloseTimer);
      successCloseTimer = null;
    }
  }

  function showFormView() {
    if (els.main) els.main.hidden = false;
    if (els.success) els.success.hidden = true;
  }

  function showSuccessView() {
    if (els.main) els.main.hidden = true;
    if (els.success) els.success.hidden = false;
  }

  function isOpen() {
    return els.card?.classList.contains("is-open");
  }

  function open() {
    ensureMounted();
    els.overlay?.classList.add("is-open");
    els.card?.classList.add("is-open");
    els.overlay?.setAttribute("aria-hidden", "false");
    els.card?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function resetForm() {
    clearSuccessTimer();
    showFormView();
    els.form?.reset();
    if (els.submit) {
      els.submit.disabled = false;
      els.submit.textContent = "提交";
    }
  }

  function close() {
    clearSuccessTimer();
    els.overlay?.classList.remove("is-open");
    els.card?.classList.remove("is-open");
    els.overlay?.setAttribute("aria-hidden", "true");
    els.card?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(resetForm, 300);
  }

  function bindEvents() {
    if (bound) return;
    bound = true;

    els.close?.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) close();
    });

    els.overlay?.addEventListener("click", (e) => {
      if (e.target === els.overlay) close();
    });

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-contact]");
      if (!trigger) return;
      e.preventDefault();
      open();
    });

    els.form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(els.form);
      const data = {
        name: String(fd.get("name") || "").trim(),
        contact: String(fd.get("contact") || "").trim(),
        company: String(fd.get("company") || "").trim(),
        issue: String(fd.get("issue") || "").trim(),
        note: String(fd.get("note") || "").trim(),
      };
      const { name, contact, company, issue, note } = data;

      if (!name || !contact || !company || !issue) {
        els.form.reportValidity?.();
        return;
      }

      if (els.submit) {
        els.submit.disabled = true;
        els.submit.textContent = "提交中...";
      }

      const record = window.ZeroWalkStorage?.appendLead(data);
      console.log("联系表单已提交", record);

      const pushed = await window.ZeroWalkContactForm?.submitForm(data);
      if (!pushed) {
        console.warn("[ZeroWalk] 企业微信未推送或推送失败，记录已保存在本地。");
      }

      showSuccessView();
      successCloseTimer = setTimeout(close, 3000);
    });
  }

  function handleDocumentClick(e) {
    if (isOpen() && e.target === els.overlay) {
      close();
      return true;
    }
    if (e.target.closest(".modal-card")) return true;
    return false;
  }

  function init() {
    ensureMounted();
    bindEvents();

    const params = new URLSearchParams(window.location.search);
    if (params.get("contact") === "1") {
      open();
      params.delete("contact");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
    }
  }

  (window.ZeroWalkRunWhenReady || ((fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }))(init);

  window.ZeroWalkContactModal = { open, close, isOpen, handleDocumentClick };
})();
