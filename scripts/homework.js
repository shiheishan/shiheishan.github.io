(() => {
  const CSV_URL = `/data/homework.csv?ts=${Date.now()}`;

  function parseCSV(text) {
    // 去 BOM、统一换行
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    text = text.replace(/\r\n?/g, '\n');

    // 简易 CSV 解析（支持引号与逗号）
    const rows = [];
    let cur = '', inQuotes = false, row = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        row.push(cur); cur = '';
      } else if (ch === '\n' && !inQuotes) {
        row.push(cur); cur = '';
        if (row.some(cell => cell.trim() !== '')) rows.push(row);
        row = [];
      } else {
        cur += ch;
      }
    }
    if (cur.length || row.length) { row.push(cur); if (row.some(c => c.trim() !== '')) rows.push(row); }

    if (!rows.length) return { header: [], data: [] };
    const header = rows[0].map(h => h.trim());
    const data = rows.slice(1).map(r => {
      const obj = {};
      header.forEach((h, idx) => obj[h] = (r[idx] ?? '').trim());
      return obj;
    });
    return { header, data };
  }

  function ensureContainer() {
    let el = document.querySelector('#homework-root') || document.querySelector('#subjects-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'homework-root';
      const main = document.querySelector('main') || document.body;
      main.appendChild(el);
    }
    return el;
  }

  function render({ header, data }) {
    const root = ensureContainer();
    root.innerHTML = '';

    // 分组：按出现顺序
    const groups = [];
    const map = new Map();
    for (const rec of data) {
      const subject = (rec.subject || '').trim();
      const task = (rec.task || '').trim();
      if (!subject && !task) continue;
      if (!map.has(subject)) { map.set(subject, { subject, items: [] }); groups.push(map.get(subject)); }
      map.get(subject).items.push(task);
    }

    for (const g of groups) {
      const card = document.createElement('section');
      card.className = 'subject-card';
      card.innerHTML = `
        <h2 class="subject-title">${g.subject || '未命名学科'}</h2>
        <ul class="task-list">
          ${g.items.map(t => `<li class="task-item">${t}</li>`).join('')}
        </ul>
      `;
      root.appendChild(card);
    }

    // —— 进度环逻辑：两列模式无完成状态 → 隐藏环
    const ring = document.querySelector('[data-role="progress-ring"]') || document.querySelector('#progress-ring');
    if (ring) {
      const hasDoneColumn = header.map(h => h.toLowerCase()).includes('done');
      if (!hasDoneColumn) {
        ring.style.display = 'none';
      } else {
        // 兼容旧站：若存在 done 列则计算百分比
        const total = data.length || 0;
        const done = data.filter(r => String(r.done).trim() === '1' || String(r.done).toLowerCase() === 'true').length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const label = ring.querySelector('[data-role="progress-label"]') || ring;
        label.textContent = `${pct}%`;
      }
    }
  }

  async function boot() {
    try {
      const res = await fetch(CSV_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCSV(text);
      render(parsed);
    } catch (err) {
      console.warn('[homework] load failed:', err);
      const root = ensureContainer();
      root.innerHTML = `<div class="hw-error">加载作业数据失败，请稍后刷新。</div>`;
      const ring = document.querySelector('[data-role="progress-ring"]') || document.querySelector('#progress-ring');
      if (ring) ring.style.display = 'none';
    }
  }

  // 延后到空闲或 DOMReady
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    (window.requestIdleCallback || setTimeout)(boot, 0);
  }
})();

