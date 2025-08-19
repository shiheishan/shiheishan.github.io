const $time = document.getElementById('time');
const $date = document.getElementById('date');
function pad(n){return String(n).padStart(2,'0');}
function tick(){
  const d = new Date();
  $time && ($time.textContent = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
  if ($date) $date.textContent = '';
}
setInterval(tick,1000); tick();

const donut = document.getElementById('progress');
const pctText = donut?.querySelector('#pctText');
const pctBar  = donut?.querySelector('#pctBar');
const C = 2 * Math.PI * 45; // r=45
if (pctBar) pctBar.style.strokeDasharray = String(C);
export function setProgress(p){
  const pct = Math.max(0, Math.min(100, p|0));
  if (pctText) pctText.textContent = pct + '%';
  if (pctBar) pctBar.style.strokeDashoffset = String(C * (1 - pct/100));
}

