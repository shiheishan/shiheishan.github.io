import { subjects } from './data.js';

let seq = 0;
const initial = subjects.map((s, i) => ({
  id: s.id,
  seq: i,
  name: s.name,
  tasks: s.tasks.map((t, j) => ({ id: `${s.id}-t${j}`, text: t, done: false }))
}));

let state = initial;

export function getState() {
  return JSON.parse(JSON.stringify(state));
}
export function setState(next) {
  state = next;
}
export function addSubject(subject) {
  state.push(subject);
}
export function removeSubject(id) {
  state = state.filter(s => s.id !== id);
}
export function updateTask(subjectId, taskId, patch) {
  const subj = state.find(s => s.id === subjectId);
  if (!subj) return;
  const task = subj.tasks.find(t => t.id === taskId);
  if (task) Object.assign(task, patch);
}
export function selectProgress() {
  const total = state.reduce((sum, s) => sum + s.tasks.length, 0);
  const done = state.reduce((sum, s) => sum + s.tasks.filter(t => t.done).length, 0);
  return total ? Math.round((done / total) * 100) : 100;
}
export function getSeq() {
  return seq++;
}
export { state };
