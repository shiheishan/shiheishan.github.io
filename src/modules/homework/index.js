import { render, updateCompletion } from './render.js';
import { debounce } from '../../shared/dom.js';
import { flipReorder, animateAutoHeight } from '../../animations/flip.js';
import {
  state,
  getState,
  setState,
  addSubject as add,
  removeSubject as remove,
  updateTask,
  selectProgress
} from './state.js';
import { sortByCompleteThenSeq } from './sort.js';

export function initHwPanel({ mount, onProgress }) {
  render(mount, state);
  updateCompletion(mount, state);
  onProgress(selectProgress());

  const debounced = debounce(() => {
    animateAutoHeight(mount, 180);
    flipReorder(mount, '.card', () => {
      const items = Array.from(mount.children).sort(sortByCompleteThenSeq);
      items.forEach(el => mount.appendChild(el));
    }, { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)', stagger: 24 });
  }, 100);

  mount.addEventListener('change', e => {
    const input = e.target;
    if (input && input.matches('input[type="checkbox"]')) {
      const card = input.closest('.subject');
      const subj = state.find(s => s.id === card.dataset.id);
      const task = subj.tasks.find(t => t.id === input.dataset.tid);
      task.done = input.checked;
      updateCompletion(mount, state);
      debounced();
      onProgress(selectProgress());
    }
  });

  return { addSubject, removeSubject, updateTask, getState, setState };
}

function addSubject(subject) {
  add(subject);
}

function removeSubject(id) {
  remove(id);
}

export { updateTask, getState, setState };
