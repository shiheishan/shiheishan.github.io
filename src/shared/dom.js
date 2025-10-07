export const qs = (sel, el = document) => el.querySelector(sel);
export const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));
export const debounce = (fn, delay = 100) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};
