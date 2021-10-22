import { COUNTER_TYPES, EVENTS } from "../utils/constants";
import { dispatch } from "../utils/events";
import { isTarget } from "../utils/status";
import CounterUI from "./ui/Counter";

function updateCounter(counter, vOff, lOff = 0, event) {
  if (event) dispatch(counter.id, event, vOff);
  else if (vOff > 0) dispatch(counter.id, EVENTS.INCREASE, vOff);
  else if (vOff < 0) dispatch(counter.id, EVENTS.DECREASE, vOff);
  else if (lOff > 0) dispatch(counter.id, EVENTS.INCREASE_LIMIT, lOff);
  else if (lOff < 0) dispatch(counter.id, EVENTS.DECREASE_LIMIT, lOff);
}

export default function Counter({
  acceleration = 0,
  counter,
  heroPhase,
  lastLabel,
  mods = [],
  onComplete,
  result,
  title,
}) {
  if (!counter) return null;
  const { step } = counter.values;

  const update = (vOff, lOff = 0, ev) => updateCounter(counter, vOff, lOff, ev);
  const canStep = [COUNTER_TYPES.SCENARIO].includes(counter.type) && heroPhase;

  const add = () => update(1);
  const onStep = () => dispatch(counter.id, EVENTS.NEW_PHASE, 1, "Phases");
  const reduce = () => update(-1);
  const increaseLimit = () => update(0, 1);
  const decreaseLimit = () => update(0, -1);
  const next = onComplete && (() => onComplete(counter));

  const handleStatusToggle = (status, flag) => {
    dispatch(
      counter.id,
      flag ? EVENTS.STATUS_ENABLE : EVENTS.STATUS_DISABLE,
      status
    );
  };

  return (
    <CounterUI
      acceleratedStep={step + acceleration}
      mods={mods.filter((m) => isTarget(counter, m.targets))}
      counter={counter}
      disabled={result || !counter.active}
      heroPhase={heroPhase}
      lastLabel={lastLabel}
      key={counter.id}
      onAdd={add}
      onAddLimit={increaseLimit}
      onNext={next}
      onStep={canStep && onStep}
      onReduce={reduce}
      onReduceLimit={decreaseLimit}
      onStatusToggle={handleStatusToggle}
      title={title}
    />
  );
}
