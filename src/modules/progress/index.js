const pad = n => String(n).padStart(2, '0');
const CN_DIGITS = '零一二三四五六七八九十';
const cnCount = n => (n <= 10 ? CN_DIGITS[n] : String(n));

// 报头的完成计数、摘要，以及吸顶的分段进度条
export function initProgress({ ticksEl, numEl, totalEl, summaryEl, counterEl }, state) {
  const ticks = new Map();
  state.forEach(subj => {
    const group = document.createElement('div');
    group.className = 'ticks__group';
    group.style.flex = String(subj.tasks.length);
    subj.tasks.forEach(task => {
      const tick = document.createElement('span');
      tick.className = 'ticks__tick';
      group.appendChild(tick);
      ticks.set(task.id, tick);
    });
    ticksEl.appendChild(group);
  });

  let prev = null;

  function renderNum(n) {
    const dir = prev == null || n >= prev ? 'is-up' : 'is-down';
    const chars = pad(n).split('');
    const spans = Array.from(numEl.children);
    // 只替换变化的那一位，让它重新播放滚动动画
    chars.forEach((ch, i) => {
      if (spans[i]?.textContent === ch) return;
      const span = document.createElement('span');
      span.className = dir;
      span.style.animationDelay = `${i * 40}ms`;
      span.textContent = ch;
      if (spans[i]) spans[i].replaceWith(span);
      else numEl.appendChild(span);
    });
    spans.slice(chars.length).forEach(s => s.remove());
  }

  function update({ done, total, pct }) {
    state.forEach(subj => subj.tasks.forEach(task => {
      ticks.get(task.id).classList.toggle('is-done', task.done);
    }));
    if (done !== prev) renderNum(done);
    totalEl.textContent = `/${pad(total)}`;
    summaryEl.textContent = done === total
      ? '全部完成，辛苦了'
      : `${cnCount(state.length)}门功课，还剩 ${total - done} 项`;
    counterEl.setAttribute('aria-valuenow', String(pct));
    prev = done;
  }

  return { update };
}
