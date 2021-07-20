import Counter from "./Counter";
import "../styles/box.css";

export default function Villain({
  counter,
  extra,
  result,
  onDefeat,
  onUpdate,
}) {
  const update = (counter, valueOffset, limitOffset = 0) => {
    if (
      (counter.levels[counter.stage][2] < 0 ||
        counter.levels[counter.stage][1] + valueOffset <=
          counter.levels[counter.stage][2] + limitOffset) &&
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
  const addPoints = () => update(counter, 0, 1);
  const reducePoints = () => update(counter, 0, -1);

  const previous = () => {
    if (counter.stage > 0) onUpdate(counter.id, { stage: counter.stage - 1 });
  };

  return (
    <div className="box">
      <div className="box__title">{counter.levels[counter.stage][0]}</div>
      <div className="box__content">
        <div>Hits</div>
        <Counter
          disabled={result}
          last={counter.stage + 1 >= counter.levels.length}
          lastLabel="☠️"
          limit={counter.levels[counter.stage][2]}
          onAdd={add}
          onAddLimit={addPoints}
          onNext={() => onDefeat(counter)}
          onPrev={counter.stage > 0 && previous}
          onReduce={reduce}
          onReduceLimit={reducePoints}
          value={counter.levels[counter.stage][1]}
        />
        {extra.map((e) => (
          <div key={e.id}>
            <div>{e.levels[e.stage][0]}</div>
            <Counter
              disabled={result || !counter.active}
              limit={e.levels[e.stage][2]}
              onAdd={() => update(e, 1)}
              onAddLimit={() => update(e, 0, 1)}
              onReduce={() => update(e, -1)}
              onReduceLimit={() => update(e, 0, -1)}
              value={e.levels[e.stage][1]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
