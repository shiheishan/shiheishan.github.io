const RADIUS = 40;
const CIRCUM = 2 * Math.PI * RADIUS;

function animateNumber(el, from, to, dur) {
  let start = null;
  let raf = null;
  if (el._numCancel) el._numCancel();
  function step(ts) {
    if (start === null) start = ts;
    const p = Math.min(1, (ts - start) / dur);
    const v = Math.round(from + (to - from) * p);
    el.textContent = v + '%';
    if (p < 1) {
      raf = requestAnimationFrame(step);
    } else {
      el._numCancel = null;
    }
  }
  el._numCancel = () => { if (raf) cancelAnimationFrame(raf); el._numCancel = null; };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || dur === 0) {
    el.textContent = Math.round(to) + '%';
    el._numCancel = null;
    return;
  }
  raf = requestAnimationFrame(step);
}

export function initDonut({ ring, text, donut }) {
  let prev = 0;
  function update(pct) {
    const root = getComputedStyle(document.documentElement);
    const dDur = parseFloat(root.getPropertyValue('--donut-dur')) || 0;
    const dEase = root.getPropertyValue('--donut-ease').trim() || 'ease';
    if (ring) {
      ring.style.strokeDasharray = CIRCUM;
      ring.style.strokeDashoffset = (1 - pct / 100) * CIRCUM;
    }
    if (text) {
      animateNumber(text, prev, pct, dDur);
      if (dDur > 0 && text.animate) {
        text._fadeAnim?.cancel();
        text._fadeAnim = text.animate(
          [{ opacity: 0.7, transform: 'translateY(2px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: dDur, easing: dEase }
        );
      }
    }
    if (donut) {
      donut.setAttribute('aria-label', `整体完成度 ${pct}%`);
    }
    prev = pct;
  }
  return { update };
}
