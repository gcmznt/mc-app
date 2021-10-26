import { EVENTS } from "./constants";

export function getMatchStats(match) {
  return {
    log: match.log.reduce(
      (acc, entry) => ({
        rounds: (acc.rounds || 1) + (entry.event === EVENTS.NEW_ROUND),
        allies: (acc.allies || 0) + (entry.event === EVENTS.ENTER_ALLY),
        allDef: (acc.allDef || 0) + (entry.event === EVENTS.ALLY_DEFEATED),
        minions: (acc.minions || 0) + (entry.event === EVENTS.ENTER_MINION),
        minDef: (acc.minDef || 0) + (entry.event === EVENTS.MINION_DEFEATED),
        schemes: (acc.schemes || 0) + (entry.event === EVENTS.ENTER_SCHEME),
        sideCl: (acc.sideCl || 0) + (entry.event === EVENTS.SIDE_CLEARED),
        flips:
          entry.entity && entry.event === EVENTS.FLIP_HERO
            ? {
                ...acc.flips,
                [entry.entity]: (acc.flips?.[entry.entity] || 0) + 1,
              }
            : acc.flips,
      }),
      {}
    ),
    finalStatus: match.counters.map((c) => ({
      name: c.aSide || c.name,
      active: c.active,
      type: c.type,
      value: c.values?.value,
      max: c.values?.max,
    })),
    heroes: match.setup.heroesAndAspects?.map((h) => ({
      name: h.name,
      counter: match.counters.find((c) => c.bSide === h.name),
    })),
    complete: match.complete,
    date: match.date,
    device: match.device,
    matchId: match.matchId,
    reason: match.reason,
    trash: match.trash,
    setup: match.setup,
    time: match.time,
  };
}
