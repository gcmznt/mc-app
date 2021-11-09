import { del, get, set, update as updateDb } from "idb-keyval";

export function countOccurrence(selection, stats) {
  return Object.fromEntries(
    selection.map((el) => [el, stats.filter((s) => s === el).length])
  );
}

function getWeigth(val, coeff = 2) {
  return 1 / (val ** 2 * coeff + 1);
}

export function getWeigths(data) {
  const stats = Array.isArray(data) ? countOccurrence(data, []) : data;
  const min = Math.min(...Object.values(stats));
  return Object.fromEntries(
    Object.entries(stats)
      .map((m) => [m[0], getWeigth(m[1] - min)])
      .map((w, i, l) => [w[0], w[1] / l.filter((v) => v[1] >= w[1]).length])
  );
}

export function getRandom(data) {
  const weigths = Array.isArray(data) ? getWeigths(data) : data;
  let n = Math.random() * Object.values(weigths).reduce((a, b) => a + b);
  for (const property in weigths) {
    if (n < weigths[property]) return property;
    n -= weigths[property];
  }
  return weigths[0];
}

export function getRandomList(data, count = 1, starting = []) {
  const l = new Set(starting);
  while (l.size < count) {
    l.add(getRandom(data));
  }
  return [...l];
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
  return get(key);
}

export function clear(key) {
  return del(key);
}

export function persist(key, value) {
  return set(key, value).then(() => value);
}

export function update(key, fn) {
  return updateDb(key, fn);
}

export function appendList(key, list) {
  return update(key, (current) => [...current, ...list]);
}

export function append(key, value) {
  return appendList(key, [value]);
}

export function getStatusObj(statuses, enabled = []) {
  return statuses.reduce(
    (acc, st) => ({ ...acc, [st]: (enabled || []).includes(st) }),
    {}
  );
}

export const minutes = (time) => `${Math.floor(time / 1000 / 60)}`;
export const seconds = (time) => `${Math.floor(time / 1000) % 60}`;
export const msToTime = (time) =>
  `${minutes(time)}:${seconds(time).padStart(2, "0")}`;

export const getClassName = (list) => list.filter((c) => c).join(" ");
