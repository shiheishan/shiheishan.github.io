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
