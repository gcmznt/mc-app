import { COUNTER_TYPES, EVENTS } from "../utils/constants";
import CounterUI from "./ui/Counter";

export default function Counter({
  acceleration = 0,
  counter,
  lastLabel,
  logEvent,
  onComplete,
  onEnable,
  onPrevious,
  onStatusToggle,
  onUpdate,
  over = true,
  result,
  title,
}) {
  const update = (counter, vOff, lOff = 0, event) => {
    const id = counter.id;
    const value = counter.levels[counter.stage].value;
    const limit = counter.levels[counter.stage].limit;

    const log = (evt, val) => logEvent(event || evt, id, val);

    if (
      (over || limit < 0 || value + vOff <= limit + lOff) &&
      value + vOff >= 0
    ) {
      if (vOff > 0 || event) log(EVENTS.INCREASE, vOff);
      else if (vOff < 0) log(EVENTS.DECREASE, -vOff);
      else if (lOff > 0) log(EVENTS.INC_LIMIT, lOff);
      else if (lOff < 0) log(EVENTS.DEC_LIMIT, -lOff);

      onUpdate(id, {
        levels: counter.levels.map((level, i) =>
          i === counter.stage
            ? { ...level, value: level.value + vOff, limit: level.limit + lOff }
            : level
        ),
      });
    }
  };

  const fullStep = counter.levels[counter.stage].step + acceleration;

  const add = () => update(counter, 1);
  const onStep = () => update(counter, fullStep, 0, EVENTS.VILLAIN_PHASE);
  const reduce = () => update(counter, -1);
  const increaseLimit = () => update(counter, 0, 1);
  const decreaseLimit = () => update(counter, 0, -1);

  const previous = () => onPrevious(counter);
  const next = () => onComplete(counter);
  const enable = () => onEnable(counter);

  return (
    <CounterUI
      acceleratedStep={fullStep}
      advance={counter.levels[counter.stage].advance}
      disabled={result || !counter.active}
      icons={counter.icons}
      last={counter.stage + 1 >= counter.levels.length}
      lastLabel={lastLabel}
      limit={counter.levels[counter.stage].limit}
      min={counter.levels[counter.stage].min || 0}
      key={counter.id}
      onAdd={add}
      onAddLimit={increaseLimit}
      onEnable={!result && onEnable && enable}
      onNext={onComplete && counter.levels[counter.stage].limit > 0 && next}
      onStep={[COUNTER_TYPES.SCENARIO].includes(counter.type) && onStep}
      onPrev={counter.stage > 0 && previous}
      onReduce={reduce}
      onReduceLimit={decreaseLimit}
      onStatusToggle={onStatusToggle}
      status={counter.status}
      over={over}
      title={title}
      value={counter.levels[counter.stage].value}
    />
  );
}
