import { EVENTS } from "../utils/constants";
import CounterUI from "./ui/Counter";

export default function Counter({
  counter,
  lastLabel,
  logEvent,
  onComplete,
  onEnable,
  onPrevious,
  onUpdate,
  over = false,
  result,
  title,
}) {
  const update = (counter, vOff, lOff = 0) => {
    const id = counter.id;
    const value = counter.levels[counter.stage][1];
    const limit = counter.levels[counter.stage][2];

    if (
      (over || limit < 0 || value + vOff <= limit + lOff) &&
      value + vOff >= 0
    ) {
      if (vOff === 1) logEvent(EVENTS.INCREASE, id, counter);
      else if (vOff === -1) logEvent(EVENTS.DECREASE, id, counter);
      else if (lOff === 1) logEvent(EVENTS.INCREASE_LIMIT, id, counter);
      else if (lOff === -1) logEvent(EVENTS.DECREASE_LIMIT, id, counter);

      onUpdate(id, {
        levels: counter.levels.map((l, i) =>
          i === counter.stage ? [l[0], l[1] + vOff, l[2] + lOff, l[3]] : l
        ),
      });
    }
  };

  const add = () => update(counter, 1);
  const reduce = () => update(counter, -1);
  const increaseLimit = () => update(counter, 0, 1);
  const decreaseLimit = () => update(counter, 0, -1);

  const previous = () => onPrevious(counter);
  const next = () => onComplete(counter);
  const enable = () => onEnable(counter);

  return (
    <CounterUI
      advance={counter.levels[counter.stage][3]}
      disabled={result || !counter.active}
      last={counter.stage + 1 >= counter.levels.length}
      lastLabel={lastLabel}
      limit={counter.levels[counter.stage][2]}
      key={counter.id}
      onAdd={add}
      onAddLimit={increaseLimit}
      onEnable={!result && onEnable && enable}
      onNext={onComplete && next}
      onPrev={counter.stage > 0 && previous}
      onReduce={reduce}
      onReduceLimit={decreaseLimit}
      over={over}
      title={title || counter.levels[counter.stage][0]}
      value={counter.levels[counter.stage][1]}
    />
  );
}
