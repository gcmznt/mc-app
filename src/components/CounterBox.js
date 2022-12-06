import { useTranslation } from "react-i18next";

import { COUNTER_TYPES, MODIFIERS } from "../utils/constants";
import Counter from "./Counter";
import Box from "./ui/Box";

export default function CounterBox({
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
  nextWarning,
  prevWarning,
}) {
  const { t } = useTranslation();

  const translate = (title) => title.split(" || ").map(t).join(" ");

  const rename = (title) => {
    return (mods || [])
      .filter((m) => m.action === MODIFIERS.RENAME)
      .reduce(
        (t, mod) => t.replace(mod.targets.replace("*", ""), mod.info),
        translate(title)
      );
  };

  const getTitle = () => {
    return counters[0].name;
  };

  const getSubTitle = () => {
    if (counters[0].type === COUNTER_TYPES.HERO) {
      if (counters[0].aSide !== counters[0].bSide) {
        return counters[0].frontSide ? counters[0].bSide : counters[0].aSide;
      } else {
        return `[${t(counters[0].frontSide ? "Alter-ego" : "Hero")}]`;
      }
    }
    return undefined;
  };

  const getIcon = () => {
    if (counters[0].type === COUNTER_TYPES.HERO) {
      if (counters[0].frontSide) return counters[0].emoji || "🧑‍💼";
      else return counters[0].bSideEmoji || "🦸";
    }
    return undefined;
  };

  return (
    <Box
      title={rename(title || getTitle())}
      subtitle={getSubTitle()}
      type={type || counters[0].type}
      highlight={highlight}
      icon={getIcon()}
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
          nextWarning={nextWarning}
          prevWarning={prevWarning}
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
