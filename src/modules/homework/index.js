import { render, updateCompletion } from './render.js';
import { debounce } from '../../shared/dom.js';
import { flipReorder } from '../../animations/flip.js';
import { state, selectProgress } from './state.js';
import { sortByCompleteThenSeq } from './sort.js';

export function initHwPanel({ mount, onProgress }) {
  render(mount, state);
  updateCompletion(mount, state);
  onProgress(selectProgress(), state);

  // 勾选后稍等片刻再把已完成的学科沉到底部
  const reorder = debounce(() => {
    const current = Array.from(mount.children);
    const sorted = current.slice().sort(sortByCompleteThenSeq);
    if (sorted.every((el, i) => el === current[i])) return;
    flipReorder(mount, '.subject', () => {
      // 移动节点会让其中的焦点丢失，排序后还给键盘用户
      const focused = mount.contains(document.activeElement) ? document.activeElement : null;
      sorted.forEach(el => mount.appendChild(el));
      focused?.focus({ preventScroll: true });
    });
  }, 420);

  mount.addEventListener('change', e => {
    const input = e.target;
    if (!input.matches('input[type="checkbox"]')) return;
    const subj = state.find(s => s.id === input.closest('.subject').dataset.id);
    subj.tasks.find(t => t.id === input.dataset.tid).done = input.checked;
    updateCompletion(mount, state);
    onProgress(selectProgress(), state);
    reorder();
  });
}
