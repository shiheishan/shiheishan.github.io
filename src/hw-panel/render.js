import { qsa } from '../utils/dom.js';

export function render(mount, state) {
  mount.innerHTML = '';
  const frag = document.createDocumentFragment();
  state.forEach(subj => {
    const card = document.createElement('div');
    card.className = 'subject';
    card.dataset.id = subj.id;
    card.dataset.seq = String(subj.seq);
    const title = document.createElement('div');
    title.className = 'subject-title';
    title.textContent = subj.name;
    const ul = document.createElement('ul');
    ul.className = 'tasks';
    subj.tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `\n        <label class="task">\n          <input type="checkbox" data-tid="${task.id}" ${task.done ? 'checked' : ''}/>\n          <span class="checkbox" aria-hidden="true"></span>\n          <span class="text">${task.text}</span>\n        </label>`;
      ul.appendChild(li);
    });
    card.appendChild(title);
    card.appendChild(ul);
    frag.appendChild(card);
  });
  mount.appendChild(frag);
}

export function updateCompletion(mount, state) {
  const cards = qsa('.subject', mount);
  cards.forEach(card => {
    const subj = state.find(s => s.id === card.dataset.id);
    const allDone = subj.tasks.length > 0 && subj.tasks.every(t => t.done);
    card.dataset.complete = allDone ? 'true' : 'false';
  });
}
