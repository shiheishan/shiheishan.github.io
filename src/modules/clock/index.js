const el = document.getElementById('now');
const fmt = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

function tick() {
  el.textContent = fmt.format(new Date());
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

if (el) {
  tick();
  schedule();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
}
