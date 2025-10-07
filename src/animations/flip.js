export function reorder(items, container, sortFn) {
  items.forEach(el => el._flipAnim?.cancel());
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supports = 'animate' in Element.prototype;
  const first = new Map(items.map(el => [el, el.getBoundingClientRect()]));
  items.sort(sortFn).forEach(el => container.appendChild(el));
  if (reduce || !supports) {
    items.forEach(el => { el.style.transform = ''; });
    return;
  }
  const last = new Map(items.map(el => [el, el.getBoundingClientRect()]));
  const motions = items.map(el => {
    const f = first.get(el), l = last.get(el);
    const dx = f.left - l.left, dy = f.top - l.top;
    return { el, dx, dy };
  }).filter(m => m.dx || m.dy);
  if (motions.length === 0) return;
  requestAnimationFrame(() => {
    motions.forEach(({ el, dx, dy }) => {
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    void document.body.offsetWidth;
    const rootStyle = getComputedStyle(document.documentElement);
    const dur = parseFloat(rootStyle.getPropertyValue('--move-dur')) || 0;
    const ease = rootStyle.getPropertyValue('--move-ease').trim() || 'ease';
    motions.forEach(({ el }, i) => {
      el._flipAnim = el.animate(
        [{ transform: el.style.transform }, { transform: 'translate(0, 0)' }],
        { duration: dur, easing: ease, delay: Math.min(i * 16, 96) }
      );
      el.style.transform = '';
    });
  });
}

export function flipReorder(container, itemSelector, mutateDOM, {
  duration = 300,
  easing = 'cubic-bezier(.2,.8,.2,1)',
  stagger = 0
} = {}) {
  const items = Array.from(container.querySelectorAll(itemSelector));
  if (!items.length) return;

  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const first = new Map(items.map(el => [el, el.getBoundingClientRect()]));

  mutateDOM();

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

export function animateAutoHeight(el, d = 200, e = 'cubic-bezier(.2,.8,.2,1)') {
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
