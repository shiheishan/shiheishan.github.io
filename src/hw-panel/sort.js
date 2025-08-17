export function sortByCompleteThenSeq(a, b) {
  const ca = a.dataset.complete === 'true' ? 1 : 0;
  const cb = b.dataset.complete === 'true' ? 1 : 0;
  if (ca !== cb) return ca - cb;
  return Number(a.dataset.seq) - Number(b.dataset.seq);
}
