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
    const rootStyle = getComputedStyle(document.documentElement)
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
