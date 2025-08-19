let seq = 0;
const initial = [
  { id: 's1', name: '语文', tasks: ['背诵《木兰诗》前半段', '完成练习册 P12-15 选择题'] },
  { id: 's2', name: '数学', tasks: ['函数单调性 2-12 题', '错题本整理 10 分钟'] },
  { id: 's3', name: '英语', tasks: ['背词 Unit 3 A-B', '完成 Workbook P20-23'] },
  { id: 's4', name: '物理', tasks: ['受力分析 3 道题', '预习 杠杆与力矩'] },
  { id: 's5', name: '化学', tasks: ['元素周期表默写', '完成配平 5 题'] },
  { id: 's6', name: '生物', tasks: ['细胞结构速记 15 分钟'] },
  { id: 's7', name: '历史', tasks: ['明清时期复习提纲'] },
  { id: 's8', name: '政治', tasks: ['核心价值观要点背诵'] },
  { id: 's9', name: '地理', tasks: ['世界气候类型速查表'] }
].map((s, i) => ({
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
