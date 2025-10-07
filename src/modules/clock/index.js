document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('now');
  if (el) {
    el.textContent = new Date().toLocaleString('zh-CN', { hour12: false });
  }
});
