import '../modules/clock/index.js';
import { initHwPanel } from '../modules/homework/index.js';
import { initDonut } from '../modules/progress/index.js';

const app = document.getElementById('app');
const ionCanvas = document.getElementById('ion-canvas');
const subjectsEl = document.getElementById('subjects');
const { update } = initDonut({
  ring: document.getElementById('ring'),
  text: document.getElementById('pctText'),
  donut: document.querySelector('.donut')
});

function celebrate() {
  if (document.body.classList.contains('disintegrate')) return;
  document.body.classList.add('disintegrate');
  const rect = app.getBoundingClientRect();
  const cw = ionCanvas.width = rect.width * (window.devicePixelRatio || 1);
  const ch = ionCanvas.height = rect.height * (window.devicePixelRatio || 1);
  const ctx = ionCanvas.getContext('2d');
  ionCanvas.style.display = 'block';
  ionCanvas.style.position = 'absolute';
  ionCanvas.style.left = '0';
  ionCanvas.style.top = '0';
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
      requestAnimationFrame(step);
    } else {
      app.classList.add('show-done');
    }
  }
  requestAnimationFrame(step);
}

initHwPanel({
  mount: subjectsEl,
  onProgress(pct) {
    update(pct);
    if (pct === 100) celebrate();
  }
});
