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

function render(){
  const frag = document.createDocumentFragment();
  DATA.forEach((subj, si) => {
    const card = document.createElement('div');
    card.className = 'subject';
    card.dataset.index = si;
    card.innerHTML = `<div class="subject-title">${subj.name}</div>`;
    const ul = document.createElement('ul');
    ul.className = 'tasks';
    subj.tasks.forEach((t, ti) => {
      const li = document.createElement('li');
      const id = `s${si}t${ti}`;
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
    updateAll();
  }
}

function updateAll(){
  const subjects = [...subjectsEl.children];
  subjects.forEach(sub => {
    const boxes = sub.querySelectorAll('input[type="checkbox"]');
    const allDone = boxes.length > 0 && [...boxes].every(b => b.checked);
    sub.dataset.complete = allDone;
  });
  const prev = new Map(subjects.map(el => [el, el.getBoundingClientRect()]));
  const incomplete = subjects.filter(el => el.dataset.complete !== 'true');
  const complete = subjects.filter(el => el.dataset.complete === 'true');
  [...incomplete, ...complete].forEach(el => subjectsEl.appendChild(el));
  const after = new Map([...subjectsEl.children].map(el => [el, el.getBoundingClientRect()]));
  after.forEach((rect, el) => {
    const first = prev.get(el);
    const dx = first.left - rect.left;
    const dy = first.top - rect.top;
    if(dx || dy){
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.opacity = '0.6';
      requestAnimationFrame(() => {
        el.style.transition = '';
        el.style.transform = '';
        el.style.opacity = '';
      });
    }
  });
  updateProgress();
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
updateAll();
