// FLIP：记录变更前位置，执行 DOM 变更后从旧位置纵向滑到新位置
export function flipReorder(container, itemSelector, mutateDOM, {
  duration = 440,
  easing = 'cubic-bezier(.2,.8,.2,1)',
  stagger = 20
} = {}) {
  const first = new Map(
    Array.from(container.querySelectorAll(itemSelector), el => [el, el.getBoundingClientRect().top])
  );

  mutateDOM();

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  container.querySelectorAll(itemSelector).forEach((el, i) => {
    const f = first.get(el);
    if (f == null) return;
    const dy = f - el.getBoundingClientRect().top;
    if (Math.abs(dy) < 1) return;
    el.animate(
      [{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
      { duration, easing, delay: i * stagger, fill: 'backwards' }
    );
  });
}
