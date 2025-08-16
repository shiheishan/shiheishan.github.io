import subjects from '../data/subjects.js';

const preview = document.getElementById('preview');
const loadTime = new Date();
const progressContainer = document.getElementById('progress');
let totalTasks = 0;

progressContainer.innerHTML = `
  <svg viewBox="0 0 36 36">
    <path class="bg" d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831" />
    <path class="meter" stroke-dasharray="0,100" d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831" />
    <text x="18" y="20.35" class="percentage">0%</text>
  </svg>
`;
const meter = progressContainer.querySelector('.meter');
const percentageText = progressContainer.querySelector('.percentage');

for (const [subject, works] of Object.entries(subjects)) {
  const section = document.createElement('section');
  section.className = 'subject';
  const h2 = document.createElement('h2');
  h2.textContent = subject;
  section.appendChild(h2);
  const tasksDiv = document.createElement('div');
  tasksDiv.className = 'tasks';
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
    tasksDiv.appendChild(label);
    totalTasks++;
  });
  section.appendChild(tasksDiv);
  h2.addEventListener('click', () => {
    if (section.classList.contains('open')) {
      tasksDiv.style.maxHeight = '0';
    } else {
      tasksDiv.style.maxHeight = tasksDiv.scrollHeight + 'px';
    }
    section.classList.toggle('open');
  });
  preview.appendChild(section);
}

const checkboxes = preview.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));

function updateProgress() {
  const checked = preview.querySelectorAll('input:checked').length;
  const percent = totalTasks === 0 ? 0 : Math.round((checked / totalTasks) * 100);
  meter.setAttribute('stroke-dasharray', `${percent},100`);
  percentageText.textContent = `${percent}%`;
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
updateProgress();
