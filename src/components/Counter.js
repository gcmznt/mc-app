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
    const value = counter.levels[counter.stage].value;
    const limit = counter.levels[counter.stage].limit;

    if (
      (over || limit < 0 || value + vOff <= limit + lOff) &&
      value + vOff >= 0
    ) {
      if (vOff === 1) logEvent(EVENTS.INCREASE, id, counter);
      else if (vOff === -1) logEvent(EVENTS.DECREASE, id, counter);
      else if (lOff === 1) logEvent(EVENTS.INCREASE_LIMIT, id, counter);
      else if (lOff === -1) logEvent(EVENTS.DECREASE_LIMIT, id, counter);

      onUpdate(id, {
        levels: counter.levels.map((level, i) =>
          i === counter.stage
            ? { ...level, value: level.value + vOff, limit: level.limit + lOff }
            : level
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
      advance={counter.levels[counter.stage].advance}
      disabled={result || !counter.active}
      last={counter.stage + 1 >= counter.levels.length}
      lastLabel={lastLabel}
      limit={counter.levels[counter.stage].limit}
      key={counter.id}
      onAdd={add}
      onAddLimit={increaseLimit}
      onEnable={!result && onEnable && enable}
      onNext={onComplete && next}
      onPrev={counter.stage > 0 && previous}
      onReduce={reduce}
      onReduceLimit={decreaseLimit}
      over={over}
      title={title || counter.levels[counter.stage].name}
      value={counter.levels[counter.stage].value}
    />
  );
}
