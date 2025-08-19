(function(){
  const STORAGE_PREFIX = 'hw:';
  const root = document.getElementById('subjects-root') || document.getElementById('homework-root');
  if (!root) return;

  function keyOf(subject, text){ return STORAGE_PREFIX + subject + ':' + text; }
  function getChecked(subject, text){ return localStorage.getItem(keyOf(subject,text)) === '1'; }
  function setChecked(subject, text, v){ localStorage.setItem(keyOf(subject,text), v ? '1' : '0'); }

  function renderTaskItem(subject, text){
    const li = document.createElement('li');
    li.className = 'task';
    const id = 't_' + Math.random().toString(36).slice(2);
    const checked = getChecked(subject, text);
    li.innerHTML = `
      <label class="task__label" for="${id}">
        <input id="${id}" class="task__input" type="checkbox" ${checked ? 'checked' : ''} />
        <span class="task__box" aria-hidden="true"></span>
        <span class="task__text"></span>
      </label>`;
    li.querySelector('.task__text').textContent = text;
    return li;
  }

  function parseCSV(text){
    const lines = text.trim().split(/\r?\n/); if (!lines.length) return [];
    const hasHeader = /subject|学科/i.test(lines[0]) && /task|内容|任务/i.test(lines[0]);
    const start = hasHeader ? 1 : 0;
    const rows = [];
    for (let i=start;i<lines.length;i++){
      const row = lines[i]; if (!row.trim()) continue;
      const cells = []; let cur=''; let q=false;
      for (let j=0;j<row.length;j++){
        const ch=row[j];
        if (ch=='"') q=!q; else if (ch==',' && !q){ cells.push(cur); cur=''; } else cur+=ch;
      }
      cells.push(cur);
      const subject = (cells[0]||'未分类').trim();
      const task    = (cells[1]||'').trim();
      if (task) rows.push({subject, task});
    }
    return rows;
  }

  async function load(){
    root.innerHTML='';
    const res = await fetch('/data/homework.csv', {cache:'no-store'});
    const csv = await res.text();
    const records = parseCSV(csv);
    const groups = new Map();
    for (const r of records){
      if (!groups.has(r.subject)) groups.set(r.subject, []);
      groups.get(r.subject).push(r.task);
    }

    for (const [subject, tasks] of groups){
      const card = document.createElement('div');
      card.className = 'subject-card card';
      const h2 = document.createElement('h2'); h2.textContent = subject; card.appendChild(h2);
      const ul = document.createElement('ul'); ul.className='task-list';
      tasks.forEach(t => ul.appendChild(renderTaskItem(subject, t)));
      card.appendChild(ul);
      root.appendChild(card);
    }

    updateProgress();
  }

  document.addEventListener('change', (e)=>{
    const input = e.target.closest('.task__input');
    if (!input) return;
    const label = input.closest('.task__label');
    const text = label.querySelector('.task__text')?.textContent || '';
    const subject = label.closest('.subject-card')?.querySelector('h2')?.textContent || '';
    setChecked(subject, text, input.checked);
    updateProgress();
  });

  function updateProgress(){
    const all = Array.from(document.querySelectorAll('.task__input'));
    const done = all.filter(i=>i.checked).length;
    const pct = all.length ? Math.round(done * 100 / all.length) : 0;
    if (window.setProgress) window.setProgress(pct);
  }

  document.addEventListener('DOMContentLoaded', load);
})();    
