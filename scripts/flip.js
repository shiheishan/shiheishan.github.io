export function flipReorder(container, itemSelector, mutateDOM, {
  duration = 300,
  easing = 'cubic-bezier(.2,.8,.2,1)',
  stagger = 0
} = {}) {
  const items = Array.from(container.querySelectorAll(itemSelector));
  if (!items.length) return;

  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const first = new Map(items.map(el => [el, el.getBoundingClientRect()]));

  mutateDOM(); // 在这里进行 append/insertBefore 等 DOM 顺序变更

  const last = new Map(items.map(el => [el, el.getBoundingClientRect()]));

  if (reduce) return;

  items.forEach((el, i) => {
    const f = first.get(el), l = last.get(el);
    if (!f || !l) return;
    const dx = f.left - l.left, dy = f.top - l.top;
    if (dx || dy) {
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0,0)' }],
        { duration, easing, fill: 'both', delay: i * stagger }
      );
    }
  });
}

export function animateAutoHeight(el, d = 200, e = 'cubic-bezier(.2,.8,.2,1)'){
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from = el.offsetHeight;
  el.style.height = 'auto';
  const to = el.offsetHeight;
  el.style.height = from + 'px';
  if (reduce) {
    el.style.height = 'auto';
    return;
  }
  el.offsetHeight;
  el.style.transition = `height ${d}ms ${e}`;
  el.style.height = to + 'px';
  el.addEventListener('transitionend', () => {
    el.style.height = 'auto';
    el.style.transition = '';
  }, { once: true });
}
