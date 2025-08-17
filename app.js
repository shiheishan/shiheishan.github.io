// ====== 学科/任务数据：按需修改 ======
const DATA = [
  { name: '语文', tasks: ['背诵《木兰诗》前半段', '完成练习册 P12-15 选择题'] },
  { name: '数学', tasks: ['函数单调性 2-12 题', '错题本整理 10 分钟'] },
  { name: '英语', tasks: ['背词 Unit 3 A-B', '完成 Workbook P20-23'] },
  { name: '物理', tasks: ['受力分析 3 道题', '预习 杠杆与力矩'] },
  { name: '化学', tasks: ['元素周期表默写', '完成配平 5 题'] },
  { name: '生物', tasks: ['细胞结构速记 15 分钟'] },
  { name: '历史', tasks: ['明清时期复习提纲'] },
  { name: '政治', tasks: ['核心价值观要点背诵'] },
  { name: '地理', tasks: ['世界气候类型速查表'] }
];

// ====== 渲染 DOM ======
const subjectsEl = document.getElementById('subjects');
const ring = document.getElementById('ring');
const pctText = document.getElementById('pctText');
const donut = document.querySelector('.donut');
const app = document.getElementById('app');
const ionCanvas = document.getElementById('ion-canvas');

const RADIUS = 40;
const CIRCUM = 2 * Math.PI * RADIUS;
let seqCounter = 0;
let resortTimer = null;
let isAnimating = false;
let pending = false;

function render(){
  const frag = document.createDocumentFragment();
    DATA.forEach((subj) => {
      const card = document.createElement('div');
      card.className = 'subject';
      card.dataset.seq = String(seqCounter++);
      card.innerHTML = `<div class="subject-title">${subj.name}</div>`;
      const ul = document.createElement('ul');
      ul.className = 'tasks';
      subj.tasks.forEach((t, ti) => {
        const li = document.createElement('li');
        const id = `s${card.dataset.seq}t${ti}`;
      li.innerHTML = `
        <label class="task" for="${id}">
          <input id="${id}" type="checkbox" />
          <span class="checkbox" aria-hidden="true"></span>
          <span class="text">${t}</span>
        </label>`;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    frag.appendChild(card);
  });
  subjectsEl.appendChild(frag);

  subjectsEl.addEventListener('change', onToggle, { passive: true });
}

function allInputs(){ return [...subjectsEl.querySelectorAll('input[type="checkbox"]')]; }

function onToggle(e){
  const target = e.target;
  if(target && target.matches('input[type="checkbox"]')){
    updateCompletion();
    scheduleResort();
  }
}

function updateCompletion(){
  const subjects = [...subjectsEl.children];
  subjects.forEach(sub => {
    const boxes = sub.querySelectorAll('input[type="checkbox"]');
    const allDone = boxes.length > 0 && [...boxes].every(b => b.checked);
    sub.dataset.complete = allDone ? 'true' : 'false';
  });
  updateProgress();
}

function scheduleResort(){
  pending = true;
  clearTimeout(resortTimer);
  resortTimer = setTimeout(() => {
    if(isAnimating) return;
    pending = false;
    resortWithFLIP();
  }, 100);
}

function resortWithFLIP(){
  const list = subjectsEl;
  const items = Array.from(list.children);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supports = window.requestAnimationFrame && window.CSS && CSS.supports && CSS.supports('color', 'var(--x)');

  items.forEach(el => {
    el.style.transition = 'none';
    el.style.transform = '';
    el.style.opacity = '';
    void el.offsetWidth;
  });
  const first = new Map(items.map(el => [el, el.getBoundingClientRect()]));

  items.sort((a,b)=>{
    const ca = a.dataset.complete === 'true' ? 1 : 0;
    const cb = b.dataset.complete === 'true' ? 1 : 0;
    if (ca !== cb) return ca - cb;
    return Number(a.dataset.seq) - Number(b.dataset.seq);
  });
  items.forEach(el => list.appendChild(el));
  list.classList.add('reordering');

  if(reduce || !supports){
    list.classList.remove('reordering');
    return;
  }

  const last = new Map(items.map(el => [el, el.getBoundingClientRect()]));
  const moved = [];
  items.forEach(el => {
    const f = first.get(el), l = last.get(el);
    const dx = f.left - l.left;
    const dy = f.top - l.top;
    if(dx || dy){
      el.style.transform = `translate(${dx}px,${dy}px)`;
      el.style.opacity = '0.96';
      moved.push(el);
    }
  });

  if(moved.length === 0){
    list.classList.remove('reordering');
    if(pending){ pending = false; resortWithFLIP(); }
    return;
  }

  isAnimating = true;
  requestAnimationFrame(() => {
    items.forEach(el => { el.style.transition = ''; });
    requestAnimationFrame(() => {
      let active = moved.length;
      moved.forEach(el => {
        const onEnd = (e) => {
          if(e.propertyName !== 'transform') return;
          el.removeEventListener('transitionend', onEnd);
          el.style.transform = '';
          el.style.opacity = '';
          if(--active === 0){
            list.classList.remove('reordering');
            isAnimating = false;
            if(pending){ pending = false; resortWithFLIP(); }
          }
        };
        el.addEventListener('transitionend', onEnd);
        el.style.transform = 'translate(0,0)';
        el.style.opacity = '';
      });
    });
  });
}

function updateProgress(){
  const inputs = allInputs();
  const total = inputs.length;
  const done = inputs.filter(i=>i.checked).length;
  const pct = total ? Math.round(done/total*100) : 100;

  if(ring){
    ring.style.strokeDasharray = CIRCUM;
    ring.style.strokeDashoffset = (1 - pct/100) * CIRCUM;
  }
  if(pctText){
    pctText.textContent = pct + '%';
  }
  if(donut){
    donut.setAttribute('aria-label', `整体完成度 ${pct}%`);
  }

  if(done === total && total > 0){
    celebrateAndVanish();
  }
}

// ====== 时间 ======
const nowEl = document.getElementById('now');
if(nowEl){
  nowEl.textContent = new Date().toLocaleString('zh-CN', { hour12: false });
}

// ====== 离子消除动画（简版粒子溶解） ======
function celebrateAndVanish(){
  if(document.body.classList.contains('disintegrate')) return;
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
  for(let i=0;i<N;i++){
    particles.push({
      x: Math.random()*cw,
      y: Math.random()*ch,
      vx: (Math.random()-0.5)*2.2,
      vy: -Math.random()*2 - .5,
      r: Math.random()*2 + .6,
      life: 1,
    });
  }

  function step(){
    ctx.clearRect(0,0,cw,ch);
    let alive = 0;
    for(const p of particles){
      p.x += p.vx*3; p.y += p.vy*3; p.vy += 0.03; p.life -= 0.008;
      if(p.life>0){
        alive++;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = '#9ad6a8';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
    }
    if(alive>0){
      requestAnimationFrame(step);
    }else{
        app.classList.add('show-done');
    }
  }
  requestAnimationFrame(step);
}

// ====== 启动 ======
render();
updateCompletion();
resortWithFLIP();
