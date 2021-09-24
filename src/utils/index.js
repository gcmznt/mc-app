export function getRandomList(list, count = 1, exclude) {
  return [
    ...new Set(
      list
        .filter((el) => !(exclude || []).includes(el))
        .sort(() => 0.5 - Math.random())
    ),
  ]
    .slice(0, count)
    .sort(() => 0.5 - Math.random());
}

export function getRandom(list, exclude) {
  return getRandomList(list, 1, exclude)[0];
}

function count(acc, curr) {
  return typeof acc[curr] !== "undefined"
    ? { ...acc, [curr]: (acc[curr] || 0) + 1 }
    : acc;
}

export function getBalancedList(selection, stats) {
  const counted = stats.reduce(
    count,
    Object.fromEntries(selection.map((el) => [el, 0]))
  );

  const max = Math.max(...Object.values(counted));
  const balanced = Object.entries(counted).map((el) =>
    new Array((max - el[1] + 1) ** 2).fill(el[0])
  );

  return balanced.flat();
}

function valReducer(moltiplier) {
  return (total, val) => total + toValue(val, moltiplier);
}

export function toValue(val, count = 1) {
  if (Array.isArray(val)) return val.reduce(valReducer(count), 0);
  if (`${val}`.match(/^(\d+)p$/)) return `${val}`.match(/^(\d+)p$/)[1] * count;
  if (isNaN(val)) return val;
  return +val;
}

export function load(key) {
  return JSON.parse(localStorage.getItem(key)) || false;
}

export function clear(key) {
  return localStorage.removeItem(key);
}

export function persist(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
}

export function append(key, value) {
  const current = load(key) || [];
  return persist(key, [...current, value]);
}

export const minutes = (time) => `${Math.floor(time / 1000 / 60)}`;
export const seconds = (time) => `${Math.floor(time / 1000) % 60}`;
export const msToTime = (time) =>
  `${minutes(time)}:${seconds(time).padStart(2, "0")}`;
