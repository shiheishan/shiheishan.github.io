(() => {
  if (window.__HW_BOOTED__) return; // 一次性守卫（防重复）
  window.__HW_BOOTED__ = true;

  const CSV_URL = `/data/homework.csv?ts=${Date.now()}`;
  const LEGACY_SEL = [
    '#subjects-root',
    '[data-role="subjects"]',
    '.subjects',
    '.subject-list',
    '.subject-card'
  ].join(',');

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
    const header = rows[0].map(h=>h.trim());
    const data = rows.slice(1).map(r => {
      const o={}; header.forEach((h,i)=>o[h]=(r[i]??'').trim()); return o;
    });
    return { header, data };
  }

  function ensureRoot() {
    let root = document.querySelector('#homework-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'homework-root';
      (document.querySelector('main') || document.body).appendChild(root);
    }
    return root;
  }

  function killLegacyOnce() {
    // 样式级隐藏（全局开关）
    document.body.setAttribute('data-hide-legacy-subjects', '1');
    // DOM 级移除：凡匹配旧选择器且不在 #homework-root 内的，一律移除
    const root = document.querySelector('#homework-root');
    document.querySelectorAll(LEGACY_SEL).forEach(el => {
      if (!root || !root.contains(el)) el.remove();
    });
  }

  function observeAndKillLegacy() {
    const root = document.querySelector('#homework-root');
    const mo = new MutationObserver(() => {
      document.querySelectorAll(LEGACY_SEL).forEach(el => {
        if (!root || !root.contains(el)) el.remove();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function render({ data }) {
    const root = ensureRoot();
    root.innerHTML = '';
    // 分组（按出现顺序）
    const groups = [];
    const map = new Map();
    for (const rec of data) {
      const s = (rec.subject||'').trim();
      const t = (rec.task||'').trim();
      if (!s && !t) continue;
      if (!map.has(s)) { map.set(s, {subject:s, items:[]}); groups.push(map.get(s)); }
      map.get(s).items.push(t);
    }
    for (const g of groups) {
      const card = document.createElement('section');
      card.className = 'hw-card';
      card.innerHTML = `
        <h2 class="hw-title">${g.subject || '未命名学科'}</h2>
        <ul class="hw-list">
          ${g.items.map(t => `<li class="hw-item">${t}</li>`).join('')}
        </ul>`;
      root.appendChild(card);
    }
  }

  async function boot() {
    try {
      killLegacyOnce();
      observeAndKillLegacy();

      const res = await fetch(CSV_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      render(parsed);

      // 进度环若有多个，仅保留一个并固定到底部中央
      const rings = Array.from(document.querySelectorAll('[data-role="progress-ring"], #progress-ring'));
      if (rings.length) {
        const first = rings[0];
        document.body.appendChild(first);
        first.style.position = 'fixed';
        first.style.left = '50%';
        first.style.bottom = '24px';
        first.style.transform = 'translateX(-50%)';
        for (let i = 1; i < rings.length; i++) rings[i].remove();
      }
    } catch (e) {
      console.warn('[homework] boot failed:', e);
      const root = ensureRoot();
      root.innerHTML = `<div class="hw-error">加载作业数据失败，请稍后刷新。</div>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    (window.requestIdleCallback || setTimeout)(boot, 0);
  }
})();
