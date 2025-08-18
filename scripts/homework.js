(() => {
  if (window.__HW_BOOTED__) return; window.__HW_BOOTED__ = true;

  const CSV_URL = `/data/homework.csv?ts=${Date.now()}`;
  const LS_KEY  = 'hw:done:v1';
  let prevPct = 0;

  // —— 工具
  function byId(id){ return document.getElementById(id); }
  // eslint-disable-next-line no-unused-vars
  function ensure(el, tag='div'){ return el || document.createElement(tag); }
  function format(ts=new Date()){
    const d = ts;
    return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  }
  function animateNumber(el, from, to, ms=380){
    const t0 = performance.now();
    const tick = (now)=>{
      const p = Math.min(1,(now-t0)/ms);
      const v = Math.round(from + (to-from)*p);
      el.textContent = `${v}%`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function animateRing(fromPct, toPct, ms=380){
    const ring = ensureRing().querySelector('.hw-ring');
    const t0 = performance.now();
    const tick = (now)=>{
      const p = Math.min(1,(now-t0)/ms);
      const deg = (fromPct + (toPct-fromPct)*p) * 3.6;
      ring.style.background = `conic-gradient(#22c55e ${deg}deg, #e5e7eb 0deg)`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // —— 存取
  function idOf(subject, task){
    const s = `${subject}||${task}`; let h = 2166136261;
    for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h.toString(36);
  }
  function loadDone(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'{}'); }catch{ return {}; } }
  function saveDone(m){ try{ localStorage.setItem(LS_KEY, JSON.stringify(m)); }catch{ /* ignore */ } }

  // —— CSV 两列解析
  function parseCSV(text){
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    text = text.replace(/\r\n?/g,'\n');
    const rows=[], row=[], push=()=>{ if(row.some(c=>c.trim()!=='')) rows.push(row.splice(0)); };
    let cur='', q=false;
    for (let i=0;i<text.length;i++){
      const ch=text[i], nx=text[i+1];
      if(ch=='"'){ if(q&&nx=='"'){cur+='"'; i++;} else q=!q; }
      else if(ch==',' && !q){ row.push(cur); cur=''; }
      else if(ch=='\n' && !q){ row.push(cur); cur=''; push(); }
      else cur+=ch;
    }
    if(cur.length||row.length){ row.push(cur); push(); }
    if(!rows.length) return [];
    const header = rows[0].map(h=>h.trim().toLowerCase());
    const sIdx = header.indexOf('subject'), tIdx = header.indexOf('task');
    return rows.slice(1).map((r, idx) => ({ subject:(r[sIdx]||'').trim(), task:(r[tIdx]||'').trim(), idx }));
  }

  // —— 时间卡片
  function ensureClock(){
    let host = byId('clock-root');
    if (!host){
      host = document.createElement('div');
      host.id = 'clock-root';
      (document.querySelector('main')||document.body).prepend(host);
    }
    host.innerHTML = `<div class="clock-card" id="clock-card"></div>`;
    const card = byId('clock-card');
    const tick = () => { card.textContent = format(new Date()); };
    tick();
    clearInterval(window.__HW_CLOCK_TMR__);
    window.__HW_CLOCK_TMR__ = setInterval(tick, 1000);
  }

  // —— 进度环
  function ensureRing(){
    let ring = document.querySelector('[data-role="progress-ring"]') || document.querySelector('#progress-ring');
    if(!ring){
      ring = document.createElement('div');
      ring.id='progress-ring'; ring.setAttribute('data-role','progress-ring');
      ring.innerHTML = `<div class="hw-ring"></div><div class="hw-ring-label" data-role="progress-label">0%</div>`;
    }
    document.body.appendChild(ring);
    Object.assign(ring.style,{position:'fixed',left:'50%',bottom:'24px',transform:'translateX(-50%)',zIndex:'999'});
    return ring;
  }
  function updateProgress(total, checked){
    const pct = total ? Math.round(checked/total*100) : 0;
    const ring = ensureRing();
    const label = ring.querySelector('[data-role="progress-label"]') || ring;
    animateNumber(label, prevPct, pct, 380);
    animateRing(prevPct, pct, 380);
    prevPct = pct;
  }

  // —— FLIP 排序：已完成置底，取消回原位（按 idx）
  function reorderWithFLIP(list, comparator){
    const children = Array.from(list.children);
    const first = new Map(children.map(el => [el, el.getBoundingClientRect()]));
    // 变更 DOM 顺序
    const sorted = Array.from(children).sort(comparator);
    sorted.forEach(el => list.appendChild(el));
    // 计算最后位置并反向位移
    requestAnimationFrame(()=>{
      sorted.forEach(el=>{
        const last = el.getBoundingClientRect();
        const invX = first.get(el).left - last.left;
        const invY = first.get(el).top  - last.top;
        el.style.transform = `translate(${invX}px, ${invY}px)`;
      });
      // 下一帧回归->触发过渡
      requestAnimationFrame(()=> sorted.forEach(el=> el.style.transform = 'translate(0,0)'));
    });
  }

  // —— 视图渲染
  function ensureRoot(){
    let root = document.querySelector('#homework-root');
    if(!root){ root = document.createElement('div'); root.id='homework-root'; (document.querySelector('main')||document.body).appendChild(root); }
    const legacy = document.querySelector('#subjects-root'); if (legacy && legacy!==root) legacy.style.display='none';
    return root;
  }

  function render(data){
    ensureClock(); // 放最上面
    const root = ensureRoot();
    const done = loadDone();
    root.innerHTML = '';

    // 分组
    const groups = []; const map = new Map();
    data.forEach(rec=>{
      const s=(rec.subject||'').trim(), t=(rec.task||'').trim();
      if(!s && !t) return;
      if(!map.has(s)) { map.set(s, { subject:s, items:[] }); groups.push(map.get(s)); }
      map.get(s).items.push({ ...rec, id:idOf(s,t) });
    });

    let total=0, checked=0;

    groups.forEach(g=>{
      const card = document.createElement('section'); card.className='hw-card';
      const title = document.createElement('h2'); title.className='hw-title'; title.textContent = g.subject || '未命名学科';
      const list  = document.createElement('ul'); list.className='hw-list';

      g.items.forEach(it=>{
        total++;
        const li = document.createElement('li'); li.className='hw-item'; li.dataset.idx = it.idx;
        const isDone = !!done[it.id]; if (isDone){ li.classList.add('hw-done'); checked++; }
        li.innerHTML = `
          <button class="hw-check" type="button" aria-pressed="${isDone}"></button>
          <div class="hw-text">${it.task || ''}</div>
        `;
        li.querySelector('.hw-check').addEventListener('click', ()=>{
          const now = li.classList.toggle('hw-done');
          li.querySelector('.hw-check').setAttribute('aria-pressed', now ? 'true' : 'false');
          if (now){ done[it.id]=1; checked++; } else { delete done[it.id]; checked--; }
          saveDone(done);
          // 使用 FLIP 排序：未完成在前；同组按原 idx
          reorderWithFLIP(list, (a,b)=>{
            const ad = a.classList.contains('hw-done') ? 1 : 0;
            const bd = b.classList.contains('hw-done') ? 1 : 0;
            if (ad !== bd) return ad - bd;
            return (+a.dataset.idx) - (+b.dataset.idx);
          });
          updateProgress(total, checked);
        });
        list.appendChild(li);
      });

      // 初次渲染也整理一次顺序
      reorderWithFLIP(list, (a,b)=>{
        const ad = a.classList.contains('hw-done') ? 1 : 0;
        const bd = b.classList.contains('hw-done') ? 1 : 0;
        if (ad !== bd) return ad - bd;
        return (+a.dataset.idx) - (+b.dataset.idx);
      });

      card.appendChild(title); card.appendChild(list);
      root.appendChild(card);
    });

    updateProgress(total, checked);
  }

  async function boot(){
    try{
      const res = await fetch(CSV_URL, { cache:'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      render(parseCSV(text));
    }catch(e){
      console.warn('[homework] boot failed:', e);
      ensureClock();
      const root = ensureRoot();
      root.innerHTML = `<div class="hw-error">加载作业数据失败，请稍后刷新。</div>`;
      updateProgress(0,0);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else (window.requestIdleCallback||setTimeout)(boot,0);
})();

