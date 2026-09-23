import '../modules/clock/index.js';
import { initHwPanel } from '../modules/homework/index.js';
import { state } from '../modules/homework/state.js';
import { initProgress } from '../modules/progress/index.js';

const doneEl = document.getElementById('done');
const doneClose = document.getElementById('doneClose');
const shell = document.querySelector('.shell');

const progress = initProgress({
  ticksEl: document.getElementById('ticks'),
  numEl: document.getElementById('doneNum'),
  totalEl: document.getElementById('total'),
  summaryEl: document.getElementById('summary'),
  counterEl: document.getElementById('counter')
}, state);

let doneTimer = 0;
let returnFocus = null;

function openDone() {
  returnFocus = document.activeElement;
  doneEl.hidden = false;
  shell.inert = true;
  doneClose.focus();
}

function closeDone() {
  if (doneEl.hidden) return;
  doneEl.hidden = true;
  shell.inert = false;
  returnFocus?.focus?.({ preventScroll: true });
}

doneClose.addEventListener('click', closeDone);
doneEl.addEventListener('click', e => { if (e.target === doneEl) closeDone(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDone(); });

let lastDone = null;

initHwPanel({
  mount: document.getElementById('subjects'),
  onProgress(p) {
    progress.update(p);
    // 从未完成变为全部完成时，等勾选动画播完再弹出；期间又改了勾选就取消
    clearTimeout(doneTimer);
    if (p.done === p.total && lastDone !== null && lastDone < p.total) {
      doneTimer = setTimeout(openDone, 700);
    }
    lastDone = p.done;
  }
});
