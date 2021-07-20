export function getRandom(list, count = 1) {
  return [...list].sort(() => 0.5 - Math.random()).slice(0, count);
}

function valReducer(moltiplier) {
  return (total, val) => total + toValue(val, moltiplier);
}

export function toValue(val, count = 1) {
  if (Array.isArray(val)) return val.reduce(valReducer(count), 0);
  if (`${val}`.match(/^(\d+)p$/)) return `${val}`.match(/^(\d+)p$/)[1] * count;
  return +val;
}
