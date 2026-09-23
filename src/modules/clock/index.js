const dateEl = document.getElementById('dateMono');
const weekTimeEl = document.getElementById('weekTime');
const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' });
const pad = n => String(n).padStart(2, '0');

function tick() {
  const now = new Date();
  dateEl.textContent = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
  weekTimeEl.textContent = `${weekday.format(now)} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// 对齐到下一个整分再每分钟刷新；回到前台时立即刷新，避免后台节流后停在旧时间
function schedule() {
  const now = new Date();
  const msToNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  setTimeout(() => {
    tick();
    setInterval(tick, 60000);
  }, msToNextMinute);
}

if (dateEl && weekTimeEl) {
  tick();
  schedule();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
}
