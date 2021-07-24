export function getRandomList(list, count = 1, exclude) {
  return list
    .filter((el) => !(exclude || []).includes(el))
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

export function getRandom(list, exclude) {
  return getRandomList(list, 1, exclude)[0];
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
