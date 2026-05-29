/** 脚本晚于 DOMContentLoaded 加载时仍能执行初始化 */
window.ZeroWalkRunWhenReady = function (fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};
