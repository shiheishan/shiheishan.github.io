import { setProgress } from '/src/app.js';

const CSV_URL = `/data/homework.csv?ts=${Date.now()}`;

function saveCheckedState(subject, text, checked) {
  const key = `hw:${subject}:${text}`;
  try {
    if (checked) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  } catch { /* ignore */ }
}

function getCheckedState(subject, text) {
  const key = `hw:${subject}:${text}`;
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    /* ignore */
    return false;
  }
}

function renderTaskItem(text, checked = false) {
  const li = document.createElement('li');
  li.className = 'task';
  const id = 't_' + Math.random().toString(36).slice(2);
  li.innerHTML = `
    <label class="task__label" for="${id}">
      <input id="${id}" class="task__input" type="checkbox" ${checked ? 'checked' : ''} />
      <span class="task__box" aria-hidden="true"></span>
      <span class="task__text"></span>
    </label>`;
  li.querySelector('.task__text').textContent = text;
  return li;
}

function updateProgress() {
  const all = document.querySelectorAll('.task__input');
  const checked = document.querySelectorAll('.task__input:checked');
  const pct = all.length ? Math.round((checked.length / all.length) * 100) : 0;
  setProgress(pct);
}

document.addEventListener('change', (e) => {
  const input = e.target.closest('.task__input');
  if (!input) return;
  const label = input.closest('.task__label');
  if (!label) return;
  const text = label.querySelector('.task__text')?.textContent || '';
  const subject = label.closest('.subject-card')?.querySelector('h2')?.textContent || '';
  saveCheckedState(subject, text, input.checked);
  updateProgress();
});

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n?/g, '\n');
  const rows = [], row = [];
  const push = () => { if (row.some((c) => c.trim() !== '')) rows.push(row.splice(0)); };
  let cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i + 1];
    if (ch === '"') { if (q && nx === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === ',' && !q) { row.push(cur); cur = ''; }
    else if (ch === '\n' && !q) { row.push(cur); cur = ''; push(); }
    else cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); push(); }
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const sIdx = header.indexOf('subject'), tIdx = header.indexOf('task');
  return rows.slice(1).map((r) => ({ subject: (r[sIdx] || '').trim(), task: (r[tIdx] || '').trim() }));
}

function render(data) {
  const root = document.getElementById('homework-root');
  if (!root) return;
  root.innerHTML = '';
  const map = new Map();
  data.forEach(({ subject, task }) => {
    if (!subject && !task) return;
    let ul = map.get(subject);
    if (!ul) {
      const card = document.createElement('div');
      card.className = 'subject-card';
      const h2 = document.createElement('h2');
      h2.textContent = subject || '';
      const list = document.createElement('ul');
      card.appendChild(h2);
      card.appendChild(list);
      root.appendChild(card);
      map.set(subject, list);
      ul = list;
    }
    ul.appendChild(renderTaskItem(task, getCheckedState(subject, task)));
  });
  updateProgress();
}

async function boot() {
  try {
    const res = await fetch(CSV_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    render(parseCSV(text));
  } catch (e) {
    console.warn('[homework] load failed:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

