(() => {
  const CSV_URL = `/data/homework.csv?ts=${Date.now()}`;

  function parseCSV(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    text = text.replace(/\r\n?/g, '\n');
    const rows = []; let cur = '', inQ = false, row = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], nx = text[i+1];
      if (ch === '"') { if (inQ && nx === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === ',' && !inQ) { row.push(cur); cur=''; }
      else if (ch === '\n' && !inQ) { row.push(cur); if (row.some(c=>c.trim()!=='')) rows.push(row); cur=''; row=[]; }
      else cur += ch;
    }
    if (cur.length || row.length) { row.push(cur); if (row.some(c=>c.trim()!=='')) rows.push(row); }
    if (!rows.length) return { header: [], data: [] };
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
      const main = document.querySelector('main') || document.body;
      main.appendChild(root);
    }
    // 隐藏旧容器，避免重复（若存在）
    const legacy = document.querySelector('#subjects-root');
    if (legacy && legacy !== root) legacy.style.display = 'none';
    return root;
  }

  function dedupeProgressRing() {
    const rings = Array.from(document.querySelectorAll('[data-role="progress-ring"], #progress-ring'));
    if (!rings.length) return;
    const first = rings[0];
    // 把第一个移到 body 末尾，设为固定定位；其余移除
    document.body.appendChild(first);
    first.style.position = 'fixed';
    first.style.left = '50%';
    first.style.bottom = '24px';
    first.style.transform = 'translateX(-50%)';
    for (let i = 1; i < rings.length; i++) rings[i].remove();
  }

  function render({ data }) {
    const root = ensureRoot();
    root.innerHTML = '';
    root.setAttribute('data-hw-root', '1');

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
        </ul>
      `;
      root.appendChild(card);
    }

    dedupeProgressRing();
  }

  async function boot() {
    try {
      const res = await fetch(CSV_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      render(parsed);
    } catch (e) {
      console.warn('[homework] load failed', e);
      const root = ensureRoot();
      root.innerHTML = `<div class="hw-error">加载作业数据失败，请稍后刷新。</div>`;
      dedupeProgressRing();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    (window.requestIdleCallback || setTimeout)(boot, 0);
  }
})();
