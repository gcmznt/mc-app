import { EVENTS } from "./Log";
import CounterUI from "./ui/Counter";

export default function Counter({
  logEvent,
  counter,
  lastLabel,
  onComplete,
  onEnable,
  onUpdate,
  over = false,
  result,
  title,
}) {
  const update = (counter, valueOffset, limitOffset = 0) => {
    if (
      (over ||
        counter.levels[counter.stage][2] < 0 ||
        counter.levels[counter.stage][1] + valueOffset <=
          counter.levels[counter.stage][2] + limitOffset) &&
      counter.levels[counter.stage][1] + valueOffset >= 0
    ) {
      if (valueOffset === 1) logEvent(EVENTS.INCREASE, counter.id, counter);
      if (valueOffset === -1) logEvent(EVENTS.DECREASE, counter.id, counter);
      if (limitOffset === 1)
        logEvent(EVENTS.INCREASELIMIT, counter.id, counter);
      if (limitOffset === -1)
        logEvent(EVENTS.DECREASELIMIT, counter.id, counter);

      onUpdate(counter.id, {
        levels: counter.levels.map((l, i) =>
          i === counter.stage
            ? [l[0], l[1] + valueOffset, l[2] + limitOffset, l[3]]
            : l
        ),
      });
    }
  };

  const add = () => update(counter, 1);
  const reduce = () => update(counter, -1);
  const increaseLimit = () => update(counter, 0, 1);
  const decreaseLimit = () => update(counter, 0, -1);

  const previous = () => {
    if (counter.stage > 0) {
      logEvent(EVENTS.PREVIOUS, counter.id, counter);
      onUpdate(counter.id, { stage: counter.stage - 1 });
    }
  };

  const next = () => {
    onComplete(counter);
  };

  const enable = () => onEnable(counter);

  return (
    counter && (
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
    )
  );
}
