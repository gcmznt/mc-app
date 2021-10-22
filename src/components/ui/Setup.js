import { useTranslation } from "react-i18next";

import Dot from "./Dot";
import "../../styles/setup.css";

export default function Setup({ setup }) {
  const { t } = useTranslation();

  return (
    <div className="setup">
      <div className="setup__heroes">
        {setup.heroesAndAspects.map((hero, i) => (
          <div key={hero.name} className="setup__hero">
            {hero.aspects.map((a) => (
              <Dot key={a} type={a.toLowerCase()} />
            ))}
            {t(hero.name)}
          </div>
        ))}
      </div>
      <div className="setup__vs">VS</div>
      <div className="setup__scenario">{t(setup.scenarioName)}</div>
      <div className="setup__scenario-info">
        {t(setup.mode)} | {t("Heroic")}: {setup.heroic}
        {setup.skirmish !== "None"
          ? ` | ${t("Skirmish level")} ${setup.skirmish}`
          : ""}
      </div>
      <div>{setup.modularSets.map(t).join(" + ")}</div>
    </div>
  );
}
