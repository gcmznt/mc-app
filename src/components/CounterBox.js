import { MODIFIERS } from "../utils/constants";
import Counter from "./Counter";
import Box from "./ui/Box";

export function CounterBox({
  acceleration,
  counters,
  highlight,
  heroPhase,
  lastLabel,
  logger,
  mods,
  onComplete,
  result,
  siblings,
  title,
  type,
}) {
  const rename = (title) =>
    (mods || [])
      .filter((m) => m.action === MODIFIERS.RENAME)
      .reduce(
        (t, mod) => t.replace(mod.targets.replace("*", ""), mod.info),
        title
      );

  return (
    <Box
      title={rename(title || counters[0].name)}
      type={type || counters[0].type}
      highlight={highlight}
    >
      {counters.map((counter) => (
        <Counter
          acceleration={acceleration}
          counter={counter}
          heroPhase={heroPhase}
          key={counter.id}
          lastLabel={lastLabel}
          logger={logger}
          mods={mods}
          onComplete={onComplete}
          result={result}
          title={title ? rename(counter.name) : false}
        />
      ))}
      {siblings.map((counter) => (
        <Counter
          counter={counter}
          onComplete={onComplete}
          heroPhase={heroPhase}
          key={counter.id}
          title={rename(counter.name)}
          logger={logger}
          mods={mods}
          result={result}
        />
      ))}
    </Box>
  );
}
