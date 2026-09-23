import { subjects } from './data.js';

export const state = subjects.map((s, i) => ({
  id: s.id,
  seq: i,
  name: s.name,
  tasks: s.tasks.map((t, j) => ({ id: `${s.id}-t${j}`, text: t, done: false }))
}));

export function selectProgress() {
  const total = state.reduce((sum, s) => sum + s.tasks.length, 0);
  const done = state.reduce((sum, s) => sum + s.tasks.filter(t => t.done).length, 0);
  return { done, total, pct: total ? Math.round((done / total) * 100) : 100 };
}
