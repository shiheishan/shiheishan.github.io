import '../modules/clock/index.js';
import { initHwPanel } from '../modules/homework/index.js';
import { initDonut } from '../modules/progress/index.js';

const app = document.getElementById('app');
const ionCanvas = document.getElementById('ion-canvas');
const subjectsEl = document.getElementById('subjects');
const doneClose = document.getElementById('doneClose');
const backdropEls = [document.querySelector('.time-card'), document.querySelector('.panel')];
const { update } = initDonut({
  ring: document.getElementById('ring'),
  text: document.getElementById('pctText'),
  donut: document.querySelector('.donut')
});

let particlesRaf = 0;

function showDone() {
  app.classList.add('show-done');
  backdropEls.forEach(el => { el.inert = true; });
  doneClose.focus();
}

function celebrate() {
  app.classList.add('is-done');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showDone();
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const cw = ionCanvas.width = app.clientWidth * dpr;
  const ch = ionCanvas.height = app.clientHeight * dpr;
  const ctx = ionCanvas.getContext('2d');
  const particles = [];
  const N = 320;
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -Math.random() * 2 - .5,
      r: Math.random() * 2 + .6,
      life: 1,
    });
  }
  function step() {
    ctx.clearRect(0, 0, cw, ch);
    let alive = 0;
    for (const p of particles) {
      p.x += p.vx * 3; p.y += p.vy * 3; p.vy += 0.03; p.life -= 0.008;
      if (p.life > 0) {
        alive++;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = '#9ad6a8';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (alive > 0) {
      particlesRaf = requestAnimationFrame(step);
    } else {
      particlesRaf = 0;
      showDone();
    }
  }
  particlesRaf = requestAnimationFrame(step);
}

function dismissDone({ restoreFocus = true } = {}) {
  if (particlesRaf) cancelAnimationFrame(particlesRaf);
  particlesRaf = 0;
  const wasShown = app.classList.contains('show-done');
  app.classList.remove('show-done', 'is-done');
  backdropEls.forEach(el => { el.inert = false; });
  if (wasShown && restoreFocus) subjectsEl.querySelector('input')?.focus({ preventScroll: true });
}

doneClose.addEventListener('click', () => dismissDone());
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && app.classList.contains('show-done')) dismissDone();
});

let lastPct = null;

initHwPanel({
  mount: subjectsEl,
  onProgress(pct) {
    update(pct);
    // 只在从未完成变为 100% 时庆祝；初始化那次只记录
    if (pct === 100 && lastPct !== null && lastPct < 100) celebrate();
    // 粒子动画期间又取消了勾选：中止庆祝
    else if (pct < 100 && app.classList.contains('is-done')) dismissDone({ restoreFocus: false });
    lastPct = pct;
  }
});
