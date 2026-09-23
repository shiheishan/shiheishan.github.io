import { qsa } from '../../shared/dom.js';

const pad = n => String(n).padStart(2, '0');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function render(mount, state) {
  mount.textContent = '';
  const frag = document.createDocumentFragment();
  state.forEach(subj => {
    const section = el('section', 'subject');
    section.dataset.id = subj.id;
    section.dataset.seq = String(subj.seq);

    const head = el('div', 'subject__head');
    head.append(el('h2', 'subject__name', subj.name), el('span', 'subject__meta'));

    const ul = el('ul', 'tasks');
    subj.tasks.forEach(task => {
      const label = el('label', 'task');
      const input = el('input');
      input.type = 'checkbox';
      input.dataset.tid = task.id;
      input.checked = task.done;
      const box = el('span', 'task__box');
      box.setAttribute('aria-hidden', 'true');
      label.append(input, box, el('span', 'task__text', task.text));
      const li = el('li');
      li.appendChild(label);
      ul.appendChild(li);
    });

    section.append(head, ul);
    frag.appendChild(section);
  });
  mount.appendChild(frag);
}

export function updateCompletion(mount, state) {
  qsa('.subject', mount).forEach(section => {
    const subj = state.find(s => s.id === section.dataset.id);
    const k = subj.tasks.filter(t => t.done).length;
    const allDone = subj.tasks.length > 0 && k === subj.tasks.length;
    section.dataset.complete = allDone ? 'true' : 'false';
    section.querySelector('.subject__meta').textContent =
      allDone ? '已完成' : `${pad(subj.seq + 1)} · ${k}/${subj.tasks.length}`;
  });
}
