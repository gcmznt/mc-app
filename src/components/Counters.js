import Counter from "./Counter";
import "../styles/box.css";

export default function Counters({
  addToLog,
  counter,
  extra,
  lastLabel,
  legend,
  onComplete,
  onEnable,
  onUpdate,
  over = false,
  result,
  title,
}) {
  const log = (values, counter) => {
    addToLog({
      counterId: counter.id,
      counterName: counter.name,
      counterStage: counter.stage,
      counterType: counter.type,
      stageName: counter.levels[counter.stage][0],
      stageOffset: 0,
      valueOffset: 0,
      limitOffset: 0,
      complete: false,
      ...values,
    });
  };

  const update = (counter, valueOffset, limitOffset = 0) => {
    if (
      (over ||
        counter.levels[counter.stage][2] < 0 ||
        counter.levels[counter.stage][1] + valueOffset <=
          counter.levels[counter.stage][2] + limitOffset) &&
      counter.levels[counter.stage][1] + valueOffset >= 0
    ) {
      log({ valueOffset, limitOffset }, counter);
      onUpdate(counter.id, {
        levels: counter.levels.map((l, i) =>
          i === counter.stage
            ? [l[0], l[1] + valueOffset, l[2] + limitOffset]
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
      log({ stageOffset: -1 }, counter);
      onUpdate(counter.id, { stage: counter.stage - 1 });
    }
  };

  const next = () => {
    if (counter.stage + 1 >= counter.levels.length) {
      log({ complete: true }, counter);
    } else {
      log({ stageOffset: 1 }, counter);
    }
    onComplete(counter);
  };

  const enable = () => {
    log({ enter: true }, counter);
    onEnable(counter);
  };

  return (
    counter && (
      <div>
        <div>{legend}</div>
        <Counter
          disabled={result || !counter.active}
          last={counter.stage + 1 >= counter.levels.length}
          lastLabel={lastLabel}
          limit={counter.levels[counter.stage][2]}
          key={counter.id}
          onAdd={add}
          onAddLimit={increaseLimit}
          onEnable={onEnable && enable}
          onNext={onComplete && next}
          onPrev={counter.stage > 0 && previous}
          onReduce={reduce}
          onReduceLimit={decreaseLimit}
          over={over}
          value={counter.levels[counter.stage][1]}
        />
      </div>
    )
  );
}
