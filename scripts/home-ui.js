/** 首页 UI：顶部导航、联系按钮与弹窗 */
(function () {
  const nav = document.getElementById("topNavTags");
  const contactBtn = document.getElementById("contactBtn");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalCard = document.getElementById("modalCard");
  const modalClose = document.getElementById("modalClose");
  const contactForm = document.getElementById("contactForm");
  const formSubmit = document.getElementById("formSubmit");

  let idle = { schedule: () => {}, clear: () => {}, getState: () => "wander" };

  function showContact() {
    contactBtn?.classList.add("is-visible");
  }

  function hideContact() {
    contactBtn?.classList.remove("is-visible");
  }

  function isModalOpen() {
    return modalCard?.classList.contains("is-open");
  }

  function openModal() {
    modalOverlay?.classList.add("is-open");
    modalCard?.classList.add("is-open");
    modalOverlay?.setAttribute("aria-hidden", "false");
    idle.clear();
  }

  function closeModal() {
    modalOverlay?.classList.remove("is-open");
    modalCard?.classList.remove("is-open");
    modalOverlay?.setAttribute("aria-hidden", "true");
    setTimeout(resetForm, 300);
    if (idle.getState() === "hold") idle.schedule();
  }

  function resetForm() {
    contactForm?.reset();
    if (formSubmit) {
      formSubmit.disabled = false;
      formSubmit.textContent = "提交";
    }
  }

  function bindIdle(handlers) {
    idle = handlers;
  }

  function handleDocumentClick(e) {
    if (isModalOpen() && e.target === modalOverlay) {
      closeModal();
      return true;
    }
    if (e.target.closest(".modal-card") || e.target.closest(".contact-btn")) {
      if (idle.getState() === "hold") idle.schedule();
      return true;
    }
    if (e.target.closest(".top-nav--home a")) {
      return true;
    }
    return false;
  }

  contactBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal();
  });

  modalClose?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isModalOpen()) closeModal();
  });

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fieldName")?.value.trim();
    const phone = document.getElementById("fieldPhone")?.value.trim();
    const need = document.getElementById("fieldNeed")?.value.trim();
    if (!name || !phone) return;

    const record = window.ZeroWalkStorage.appendLead({ name, phone, need });
    console.log("联系表单已提交", record);

    if (formSubmit) {
      formSubmit.disabled = true;
      formSubmit.textContent = "已收到，我们会尽快联系您 ✓";
    }
    setTimeout(closeModal, 2000);
  });

  window.ZeroWalkHomeUI = {
    showContact,
    hideContact,
    openModal,
    closeModal,
    isModalOpen,
    bindIdle,
    handleDocumentClick,
  };
})();
