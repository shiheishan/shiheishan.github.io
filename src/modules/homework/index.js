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

  const blurEl = mount.closest('.panel')?.querySelector('.panel__blur');
  let blurRaf = 0;

  const syncBlur = () => {
    if (!blurEl) return;
    if (blurRaf) cancelAnimationFrame(blurRaf);
    blurRaf = requestAnimationFrame(() => {
      blurRaf = 0;
      const { scrollTop, scrollHeight, clientHeight } = mount;
      const overflow = scrollHeight - clientHeight > 2;
      if (!overflow) {
        blurEl.dataset.state = 'hidden';
        blurEl.style.removeProperty('--blur-progress');
        return;
      }
      const remaining = scrollHeight - clientHeight - scrollTop;
      const ratio = Math.max(0, Math.min(1, remaining / 120));
      if (ratio <= 0.01) {
        blurEl.dataset.state = 'hidden';
        blurEl.style.removeProperty('--blur-progress');
      } else {
        blurEl.dataset.state = 'visible';
        blurEl.style.setProperty('--blur-progress', ratio.toFixed(3));
      }
    });
  };

  const debounced = debounce(() => {
    animateAutoHeight(mount, 180);
    flipReorder(mount, '.card', () => {
      const items = Array.from(mount.children).sort(sortByCompleteThenSeq);
      items.forEach(el => mount.appendChild(el));
    }, { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)', stagger: 24 });
    syncBlur();
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
      syncBlur();
    }
  });

  if (blurEl) {
    mount.addEventListener('scroll', syncBlur, { passive: true });
    window.addEventListener('resize', syncBlur);
    syncBlur();
  }

  return { addSubject, removeSubject, updateTask, getState, setState };
}

function addSubject(subject) {
  add(subject);
}

function removeSubject(id) {
  remove(id);
}

export { updateTask, getState, setState };
