async function loadHomework() {
  let root = document.getElementById('homework-root');
  if (!root) root = document.getElementById('subjects-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'homework-root';
    const panel = document.querySelector('.panel__body') || document.body;
    panel.appendChild(root);
  }
  const parent = root.parentElement;
  if (parent && parent.id === 'subjects') {
    parent.innerHTML = '';
    parent.appendChild(root);
  }
  const res = await fetch('/data/homework.csv');
  const text = await res.text();
  const records = parseCSV(text);
  const groups = [];
  for (const { subject, task } of records) {
    let g = groups.find(s => s.subject === subject);
    if (!g) {
      g = { subject, tasks: [] };
      groups.push(g);
    }
    g.tasks.push(task);
  }
  groups.forEach(g => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    const title = document.createElement('h2');
    title.textContent = g.subject;
    card.appendChild(title);
    const ul = document.createElement('ul');
    g.tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.textContent = t;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    root.appendChild(card);
  });
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        if (inQuotes && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    out.push({ subject: cells[0].trim(), task: cells[1].trim() });
  }
  return out;
}

document.addEventListener('DOMContentLoaded', loadHomework);
