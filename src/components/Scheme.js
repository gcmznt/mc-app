import Counter from "./Counter";
import "../styles/box.css";

export default function Scheme({ counter, result, onComplete, onUpdate }) {
  const update = (counter, valueOffset, limitOffset = 0) => {
    if (
      counter.levels[counter.stage][1] + valueOffset <=
        counter.levels[counter.stage][2] + limitOffset &&
      counter.levels[counter.stage][1] + valueOffset >= 0
    ) {
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
  const addTarget = () => update(counter, 0, 1);
  const reduceTarget = () => update(counter, 0, -1);

  const previous = () => {
    if (counter.stage > 0) {
      onUpdate(counter.id, { stage: counter.stage - 1 });
    }
  };

  return (
    <div className="box">
      <div className="box__title">{counter.levels[counter.stage][0]}</div>
      <div className="box__content">
        <div>Threats</div>
        <Counter
          disabled={result}
          labelNext="Completed"
          last={counter.stage + 1 >= counter.levels.length}
          limit={counter.levels[counter.stage][2]}
          mod="scheme"
          onAdd={add}
          onAddLimit={addTarget}
          onNext={() => onComplete(counter)}
          onPrev={counter.stage > 0 && previous}
          onReduce={reduce}
          onReduceLimit={reduceTarget}
          value={counter.levels[counter.stage][1]}
        />
      </div>
    </div>
  );
}
