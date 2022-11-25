import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/data";
import { ASPECTS, PRECON, RANDOM } from "../../utils/constants";

export default function Player({ onChange, pos, settings }) {
  const { data, selection } = useData();
  const { t } = useTranslation();

  const value = settings[`player${pos}`];
  const aspects = settings[`aspects${pos}`];

  const byName = (a, b) => t(a).localeCompare(t(b));

  const handleChangeP = (e) => onChange(`player${pos}`)(e.target.value);
  const handleChangeA = (i) => (e) =>
    onChange(`aspects${pos}`)(
      aspects.map((a, j) => (i === j ? e.target.value : a))
    );

  useEffect(() => {
    if (value !== RANDOM && !selection.heroes.includes(value)) {
      onChange(`player${pos}`)(RANDOM);
    }
  }, [onChange, pos, selection.heroes, value]);

  const aspectsCount = data.getHero(value)?.aspects.length || 1;

  return (
    <div>
      <label>
        <span style={{ display: "inline-block", width: "1em" }}>{pos}</span>
        <select value={value} onChange={handleChangeP}>
          <option value={RANDOM}>⁉️ {t("Random")}</option>
          {selection.heroes.sort(byName).map((hero) => {
            const heroData = data.getHero(hero);
            return (
              <option key={hero} value={hero}>
                {t(heroData.name)}
                {heroData.alterEgo !== heroData.name
                  ? ` | ${t(heroData.alterEgo)}`
                  : ""}
              </option>
            );
          })}
        </select>
      </label>
      <div style={{ display: "inline-block" }}>
        {aspectsCount < ASPECTS.length &&
          new Array(aspectsCount).fill(true).map((_, i) => (
            <label key={i}>
              <select value={aspects[i]} onChange={handleChangeA(i)}>
                <option value={RANDOM}>⁉️ {t("Random")}</option>
                <option value={PRECON}>♥️ {t("Precon")}</option>
                {ASPECTS.sort(byName).map((aspect) => (
                  <option key={aspect} value={aspect}>
                    {t(aspect)}
                    {data.getHero(value)?.aspects[i] === aspect ? " ♥️" : ""}
                  </option>
                ))}
              </select>
            </label>
          ))}
      </div>
    </div>
  );
}
