import subjects from '../data/subjects.js';

const preview = document.getElementById('preview');
const loadTime = new Date();

for (const [subject, works] of Object.entries(subjects)) {
  const section = document.createElement('section');
  section.className = 'subject';
  const h2 = document.createElement('h2');
  h2.textContent = subject;
  section.appendChild(h2);
  works.forEach(work => {
    const label = document.createElement('label');
    label.className = 'task';
    const input = document.createElement('input');
    input.type = 'checkbox';
    const box = document.createElement('span');
    box.className = 'checkbox';
    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = work;
    label.appendChild(input);
    label.appendChild(box);
    label.appendChild(text);
    section.appendChild(label);
  });
  preview.appendChild(section);
}

function displayLoadTime() {
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  document.getElementById('date').textContent = fmt.format(loadTime);
}

displayLoadTime();
