const pad = n => String(n).padStart(2, '0');
const CN_DIGITS = '零一二三四五六七八九十';
const cnCount = n => (n <= 10 ? CN_DIGITS[n] : String(n));

// 报头的完成计数、摘要，以及分段进度条
export function initProgress({ ticksEl, numEl, totalEl, summaryEl, counterEl }, state) {
  const ticks = new Map();
  const groups = new Map();
  state.forEach(subj => {
    const group = document.createElement('div');
    group.className = 'ticks__group';
    group.style.flex = String(subj.tasks.length);
    const row = document.createElement('div');
    row.className = 'ticks__row';
    subj.tasks.forEach(task => {
      const tick = document.createElement('span');
      tick.className = 'ticks__tick';
      row.appendChild(tick);
      ticks.set(task.id, tick);
    });
    // 宽屏时显示在每组下方的科目名
    const label = document.createElement('span');
    label.className = 'ticks__label';
    label.textContent = subj.name;
    group.append(row, label);
    ticksEl.appendChild(group);
    groups.set(subj.id, group);
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
    state.forEach(subj => {
      subj.tasks.forEach(task => ticks.get(task.id).classList.toggle('is-done', task.done));
      groups.get(subj.id).classList.toggle('is-complete', subj.tasks.every(t => t.done));
    });
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
