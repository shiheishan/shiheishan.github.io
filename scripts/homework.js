(() => {
  if (window.__HW_BOOTED__) return; window.__HW_BOOTED__ = true;

  const CSV_URL = `/data/homework.csv?ts=${Date.now()}`;
  const LS_KEY = 'hw:done:v1';

  // 简易 hash，作为任务 id（subject|task）
  function idOf(subject, task) {
    const s = `${subject}||${task}`;
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h.toString(36);
  }

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  }
  function saveDone(map) { try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch { /* ignore */ } }

  function parseCSV(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    text = text.replace(/\r\n?/g, '\n');
    const rows = []; let cur='', inQ=false, row=[];
    for (let i=0;i<text.length;i++){
      const ch=text[i], nx=text[i+1];
      if (ch === '"'){ if(inQ && nx === '"'){cur+='"'; i++;} else inQ=!inQ; }
      else if (ch === ',' && !inQ){ row.push(cur); cur=''; }
      else if (ch === '\n' && !inQ){ row.push(cur); if(row.some(c=>c.trim()!=='')) rows.push(row); cur=''; row=[]; }
      else cur += ch;
    }
    if (cur.length || row.length){ row.push(cur); if(row.some(c=>c.trim()!=='')) rows.push(row); }
    if (!rows.length) return { header:[], data:[] };
    const header = rows[0].map(h=>h.trim().toLowerCase());
    const data = rows.slice(1).map(r => {
      const obj = {}; header.forEach((h,i)=> obj[h] = (r[i] ?? '').trim());
      return obj;
    });
    return { data };
  }

  function ensureRoot() {
    let root = document.querySelector('#homework-root');
    if (!root) { root = document.createElement('div'); root.id = 'homework-root'; (document.querySelector('main') || document.body).appendChild(root); }
    // 隐藏旧容器，避免重复
    const legacy = document.querySelector('#subjects-root'); if (legacy && legacy !== root) legacy.style.display = 'none';
    return root;
  }

  function ensureRing() {
    // 仅保留一个进度环
    let ring = document.querySelector('[data-role="progress-ring"]') || document.querySelector('#progress-ring');
    if (!ring) {
      ring = document.createElement('div');
      ring.id = 'progress-ring';
      ring.setAttribute('data-role','progress-ring');
      ring.innerHTML = `<div class="hw-ring"></div><div class="hw-ring-label" data-role="progress-label">0%</div>`;
      document.body.appendChild(ring);
    } else {
      document.body.appendChild(ring);
    }
    Object.assign(ring.style, {position:'fixed', left:'50%', bottom:'24px', transform:'translateX(-50%)', zIndex:'999'});
    return ring;
  }

  function renderRing(percent) {
    percent = Math.max(0, Math.min(100, Math.round(percent)));
    const ring = ensureRing();
    const deg = percent * 3.6;
    const shell = ring.querySelector('.hw-ring');
    const label = ring.querySelector('[data-role="progress-label"]') || ring;
    if (shell) shell.style.background = `conic-gradient(#22c55e ${deg}deg, #e5e7eb 0deg)`;
    label.textContent = `${percent}%`;
  }

  function render(data) {
    const root = ensureRoot();
    const done = loadDone();
    root.innerHTML = '';

    // 分组（按出现顺序）
    const groups = [];
    const map = new Map();
    for (const r of data) {
      const subject = (r.subject || '').trim();
      const task = (r.task || '').trim();
      if (!subject && !task) continue;
      if (!map.has(subject)) { map.set(subject, {subject, items:[]}); groups.push(map.get(subject)); }
      map.get(subject).items.push({ subject, task, id: idOf(subject, task) });
    }

    let total = 0, checked = 0;

    for (const g of groups) {
      const card = document.createElement('section');
      card.className = 'hw-card';
      const list = document.createElement('ul');
      list.className = 'hw-list';

      for (const it of g.items) {
        total++;
        const li = document.createElement('li');
        li.className = 'hw-item';
        const isDone = !!done[it.id];
        if (isDone) { li.classList.add('hw-done'); checked++; }

        li.innerHTML = `
          <button class="hw-check" type="button" aria-pressed="${isDone}"></button>
          <div class="hw-text">${it.task || ''}</div>
        `;

        li.querySelector('.hw-check').addEventListener('click', () => {
          const now = li.classList.toggle('hw-done');
          li.querySelector('.hw-check').setAttribute('aria-pressed', now ? 'true' : 'false');
          if (now) { done[it.id] = 1; checked++; } else { delete done[it.id]; checked--; }
          saveDone(done);
          renderRing(total ? (checked / total) * 100 : 0);
        });

        list.appendChild(li);
      }

      card.innerHTML = `<h2 class="hw-title">${g.subject || '未命名学科'}</h2>`;
      card.appendChild(list);
      root.appendChild(card);
    }

    renderRing(total ? (checked / total) * 100 : 0);
  }

  async function boot() {
    try {
      const res = await fetch(CSV_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const { data } = parseCSV(text);
      render(data);
    } catch (e) {
      console.warn('[homework] boot failed:', e);
      const root = ensureRoot();
      root.innerHTML = `<div class="hw-error">加载作业数据失败，请稍后刷新。</div>`;
      renderRing(0);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else (window.requestIdleCallback || setTimeout)(boot, 0);
})();
