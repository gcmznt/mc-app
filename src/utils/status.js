import { useState } from "react";
import { COUNTER_TYPES as CTYPES, EVENTS } from "./constants";
import { getCustomCounter } from "./counters";

export const isActive = (counter) => counter.active;
const childOf = (parent) => (counter) => counter.parent === parent.id;
const isLast = (counter) => !counter.next;
const isType = (type) => (counter) => counter.type === type;

export function getActiveIcons(counters) {
  return (counters || [])
    .filter(isActive)
    .map((c) => c.icons || [])
    .flat()
    .sort((a, b) => a.localeCompare(b));
}

export function getModifiers(counters) {
  return (counters || [])
    .filter(isActive)
    .map((c) => c.modifiers || [])
    .flat();
}

export function getAcceleration(counters, icons) {
  return (
    counters.reduce((a, cur) => a + cur.values.value || 0, 0) +
    icons.reduce((a, b) => a + +(b === "Acceleration"), 0)
  );
}

export function isTarget(counter, targets) {
  return (
    counter.id === targets ||
    counter.name === targets ||
    (targets.startsWith("+") &&
      counter.type === targets.slice(1) &&
      counter.active) ||
    (targets.startsWith("*") && counter.type === targets.slice(1)) ||
    (targets.endsWith("*") && counter.name.startsWith(targets.slice(0, -1)))
  );
}

export function getPrev(counter, counters = []) {
  return counters.find((c) => c.next === counter.name);
}

export function getChain(counter, counters = []) {
  const prev = getPrev(counter, counters);
  return prev ? [...getChain(prev, counters), counter] : [counter];
}

export function getSets(counters, getLastActive) {
  const ofType = (type) => (counters || []).filter(isType(type));

  return {
    all: counters,
    actives: (counters || []).filter(isActive),
    accelerationCounters: ofType(CTYPES.ACCELERATION),
    allyCounters: [...ofType(CTYPES.ALLY), ...ofType(CTYPES.ALLY_TOKEN)],
    minionCounters: ofType(CTYPES.MINION),
    customCounters: ofType(CTYPES.CUSTOM),
    extraCounters: [...ofType(CTYPES.SUPPORT), ...ofType(CTYPES.UPGRADE)],
    heroesCounters: ofType(CTYPES.HERO),
    mainScheme: ofType(CTYPES.SCENARIO).filter(isLast).map(getLastActive),
    phasesCounter: ofType(CTYPES.PHASES)[0],
    roundsCounter: ofType(CTYPES.ROUNDS)[0],
    sideSchemes: [
      ...ofType(CTYPES.MODULAR_SCHEME),
      ...ofType(CTYPES.NEMESIS_SCHEME),
      ...ofType(CTYPES.SIDE_SCHEME),
    ],
    villainCounters: ofType(CTYPES.VILLAIN).filter(isLast).map(getLastActive),
  };
}

export function useCountersUtils() {
  const [counters, setCounters] = useState(false);

  const counterUtils = {
    set: (counters) => setCounters(counters),
    createCounter: (type, name, opts, players) => {
      const count = counterUtils.startsWith(name).length;
      const counters = getCustomCounter(
        type,
        {
          active: false,
          name: `${name || type} ${count + 1}`,
          ...opts,
        },
        players
      );

      counters.forEach(counterUtils.add);
      return counters;
    },
    add: (counter) => {
      setCounters((cs) => [...cs, counter]);
      return counter;
    },
    remove: (counter) =>
      setCounters((cs) => cs.filter((c) => c.id !== counter.id)),
    all: counters,
    activesCount: (counters || []).filter(isActive).length,
    name: (name) => (counters || []).find((c) => c.name === name),
    startsWith: (name) =>
      (counters || []).filter((c) => c.name.startsWith(name)),
    rename: (counter, name, replace) => counter.rename(name, replace),
    id: (id) => (counters || []).find((c) => c.id === id),
    type: (type) => (counters || []).filter(isType(type)),
    getSets: () => getSets(counters, counterUtils.getLastActive),
    getActiveIcons: () => getActiveIcons(counters),
    getModifiers: () => getModifiers(counters),
    getLast: (counter) => {
      return counter?.next
        ? counterUtils.getLast(counterUtils.next(counter))
        : counter;
    },
    getLastActive: (counter) => {
      if (!counter) return false;
      if (counter.active) return counter;

      const prev = counterUtils.prev(counter);
      return counterUtils.getLastActive(prev) || (!counter.next && counter);
    },
    children: (counter) => counters.filter(childOf(counter)),
    getChain: (counter) => getChain(counter, counters),
    ofChain: (active) => {
      const chain = counterUtils.getChain(active).map((c) => c.id);
      return counters.filter((counter) => chain.includes(counter.parent));
    },
    next: (counter) => counters.find((c) => c.name === counter.next),
    prev: (counter) => counters.find((c) => c.next === counter.name),
    advance: (counter, runTriggers) => {
      const next = counterUtils.next(counter);
      runTriggers(next, EVENTS.ENTER);
      next.enable();
      counter.disable();

      Object.entries(counter.statuses || {}).forEach(([status, flag]) => {
        if (flag) next.enableStatus(status);
      });
    },
    back: (counter) => {
      counterUtils.next(counter).disable();
      counterUtils.next(counter).resetStatuses();
      return counter.enable();
    },
    toggleTree: (counter, flag) => {
      counter.toggle(flag);
      counterUtils
        .ofChain(counter)
        .map((c) => counterUtils.toggleTree(c, flag));
    },
    enableTree: (counter) => counterUtils.toggleTree(counter, true),
    disableTree: (counter) => counterUtils.toggleTree(counter, false),
    getTargets: (targets) => {
      return counters.filter((counter) => isTarget(counter, targets));
    },
  };

  return counterUtils;
}
