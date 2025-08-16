import subjects from '../data/subjects.js';
const preview = document.getElementById('preview');
const loadTime = new Date();
let totalTasks = 0;
for (const [subject, works] of Object.entries(subjects)) {
  const section = document.createElement('section');
  section.className = 'subject';
  const h2 = document.createElement('h2');
  h2.textContent = subject;
  section.appendChild(h2);
  works.forEach(work => {
    totalTasks++;
    const label = document.createElement('label');
    label.className = 'task';
    const input = document.createElement('input');
    input.type = 'checkbox';
    const box = document.createElement('span');
    box.className = 'checkbox';
    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = work;
    label.appendChild(input);
    label.appendChild(box);
    label.appendChild(text);
    section.appendChild(label);
    input.addEventListener('change', () => {
      updateProgress();
      checkSubject(section);
    });
  });
  preview.appendChild(section);
}
wrapChars(document.querySelector('.container'));
let completedTasks = 0;
let lastPercent = 0;
let progressRaf;
function updateProgress() {
  completedTasks = document.querySelectorAll('#preview input:checked').length;
  const target = Math.round((completedTasks / totalTasks) * 100);
  const ring = document.getElementById('progress-ring');
  const text = document.getElementById('progress-text');
  cancelAnimationFrame(progressRaf);
  function step() {
    if (lastPercent !== target) {
      lastPercent += lastPercent < target ? 1 : -1;
      ring.style.strokeDashoffset = 314 * (1 - lastPercent / 100);
      text.textContent = lastPercent + '%';
      progressRaf = requestAnimationFrame(step);
    } else {
      ring.style.strokeDashoffset = 314 * (1 - lastPercent / 100);
      text.textContent = lastPercent + '%';
    }
  }
  step();
}
function checkSubject(section) {
  const checks = section.querySelectorAll('input').length;
  const checked = section.querySelectorAll('input:checked').length;
  if (checks === checked && !section.classList.contains('completed')) {
    const prevPositions = getPositions();
    section.classList.add('moving');
    setTimeout(() => {
      section.classList.remove('moving');
      section.classList.add('completed', 'fade-in');
      preview.appendChild(section);
      setTimeout(() => section.classList.remove('fade-in'), 600);
      animateReorder(prevPositions, section);
      checkAll();
    }, 600);
  } else if (checked < checks && section.classList.contains('completed')) {
    const prevPositions = getPositions();
    preview.insertBefore(section, preview.querySelector('.subject:not(.completed)'));
    section.classList.remove('completed');
    animateReorder(prevPositions, section);
  }
}
function checkAll() {
  const total = document.querySelectorAll('.subject').length;
  const done = document.querySelectorAll('.subject.completed').length;
  if (total === done) {
    showFinal();
  }
}
function showFinal() {
  const container = document.querySelector('.container');
  wrapChars(container);
  const chars = container.querySelectorAll('.char');
  chars.forEach(span => {
    span.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
    span.style.setProperty('--dy', (Math.random() - 0.5) * 200 + 'px');
  });
  container.classList.add('disintegrate');
  setTimeout(() => {
    container.style.display = 'none';
    const overlay = document.getElementById('final-overlay');
    overlay.style.display = 'block';
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    overlay.appendChild(canvas);
    startParticles(canvas);
    setTimeout(() => {
      canvas.remove();
      const text = document.createElement('div');
      text.id = 'final-text';
      text.textContent = '今日任务完成，请好好休息';
      overlay.appendChild(text);
      wrapChars(text);
      requestAnimationFrame(() => text.classList.add('show'));
    }, 1500);
  }, 1000);
}
function startParticles(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    alpha: 1
  }));
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    if (particles.some(p => p.alpha > 0)) {
      requestAnimationFrame(animate);
    }
  }
  animate();
}
function displayLoadTime() {
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',second: '2-digit',
    hour12: false
  });
  const str = fmt.format(loadTime);
  const header = document.getElementById('date');
  header.innerHTML = '';
  for (const ch of str) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    header.appendChild(span);
  }
}
displayLoadTime();
updateProgress();

function wrapChars(el) {
  el.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split('').forEach(ch => {
        const span = document.createElement('span');
        span.textContent = ch;
        span.className = 'char';
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1) {
      if (node.namespaceURI !== 'http://www.w3.org/2000/svg') {
        wrapChars(node);
      }
    }
  });
}

function getPositions() {
  return Array.from(preview.children).map(el => [el, el.getBoundingClientRect().top]);
}

function animateReorder(prev, skip) {
  Array.from(preview.children).forEach(el => {
    if (el === skip) return;
    const old = prev.find(p => p[0] === el);
    if (!old) return;
    const dy = old[1] - el.getBoundingClientRect().top;
    if (dy) {
      el.style.transition = 'none';
      el.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = '';
        el.style.transform = '';
      });
    }
  });
}
