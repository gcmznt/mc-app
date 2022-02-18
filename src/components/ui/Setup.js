import { useTranslation } from "react-i18next";

import Dot from "./Dot";
import "../../styles/setup.css";
import { BoxBand } from "./Box";
import {
  getHeroesAndAspects,
  getModularSets,
  getScenarioName,
} from "../../utils/statistics";

export default function Setup({ setup }) {
  const { t } = useTranslation();

  return (
    <div className="setup">
      <div className="setup__heroes">
        {getHeroesAndAspects(setup).map((hero, i) => (
          <div key={i} className="setup__hero">
            {hero.aspects.map((a) => (
              <Dot key={a.toLowerCase()} type={a.toLowerCase()} />
            ))}
            {t(hero.name)}
          </div>
        ))}
      </div>
      <BoxBand>VS</BoxBand>
      <div className="setup__scenario">{t(getScenarioName(setup))}</div>
      <div>
        {getModularSets(setup).length
          ? getModularSets(setup).map(t).join(" + ")
          : t("No modular set")}
      </div>
      <div className="setup__scenario-info">
        {t(setup.mode)} | {t("Heroic")}: {setup.heroic}
        {setup.skirmish !== "None"
          ? ` | ${t("Skirmish level")} ${setup.skirmish}`
          : ""}
      </div>
    </div>
  );
}
