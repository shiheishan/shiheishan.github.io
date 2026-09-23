import { qsa } from '../../shared/dom.js';

export function render(mount, state) {
  mount.innerHTML = '';
  const frag = document.createDocumentFragment();
  state.forEach(subj => {
    const card = document.createElement('div');
    card.className = 'subject card';
    card.dataset.id = subj.id;
    card.dataset.seq = String(subj.seq);
    const title = document.createElement('div');
    title.className = 'subject-title';
    title.textContent = subj.name;
    const ul = document.createElement('ul');
    ul.className = 'tasks';
    subj.tasks.forEach(task => {
      const li = document.createElement('li');
      const label = document.createElement('label');
      label.className = 'task';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.tid = task.id;
      input.checked = task.done;
      const box = document.createElement('span');
      box.className = 'checkbox';
      box.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span');
      text.className = 'text';
      text.textContent = task.text;
      label.append(input, box, text);
      li.appendChild(label);
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
