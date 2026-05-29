/** 首页 UI：顶部导航、汇聚后联系区（弹窗由 contact-modal.js 负责） */
(function () {
  const contactPanel = document.getElementById("contactPanel");

  let idle = { schedule: () => {}, clear: () => {}, getState: () => "wander" };

  function showContact() {
    contactPanel?.classList.add("is-visible");
    contactPanel?.setAttribute("aria-hidden", "false");
  }

  function hideContact() {
    contactPanel?.classList.remove("is-visible");
    contactPanel?.setAttribute("aria-hidden", "true");
  }

  function isModalOpen() {
    return window.ZeroWalkContactModal?.isOpen?.() ?? false;
  }

  function closeModal() {
    window.ZeroWalkContactModal?.close();
    if (idle.getState() === "hold") idle.schedule();
  }

  function bindIdle(handlers) {
    idle = handlers;
  }

  function handleDocumentClick(e) {
    if (window.ZeroWalkContactModal?.handleDocumentClick?.(e)) {
      if (idle.getState() === "hold") idle.schedule();
      return true;
    }
    if (e.target.closest(".contact-btn") || e.target.closest(".home-contact-panel")) {
      if (idle.getState() === "hold") idle.schedule();
      return true;
    }
    if (e.target.closest(".top-nav--home a")) {
      return true;
    }
    return false;
  }

  window.ZeroWalkHomeUI = {
    showContact,
    hideContact,
    closeModal,
    isModalOpen,
    bindIdle,
    handleDocumentClick,
  };
})();
