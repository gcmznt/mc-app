import { useTranslation } from "react-i18next";
import { useData } from "../../context/data";
import {
  FULL_RANDOM,
  NONE,
  RANDOM,
  RANDOM_REPLACEMENT,
  SUGGESTED,
} from "../../utils/constants";

export default function ModularSets({ onChange, value, list }) {
  const { selection } = useData();
  const { t } = useTranslation();

  const handleChange = (e) => {
    onChange("modularSets")(e.target.value);
    if (!isNaN(e.target.value)) {
      onChange("modularSetsList")(
        new Array(+e.target.value).fill(true).map((m, i) => list[i] || RANDOM)
      );
    } else {
      onChange("modularSetsList")([]);
    }
  };
  const handleChangeMod = (e, pos) =>
    onChange("modularSetsList")(
      list.map((el, i) => (i === pos ? e.target.value : el))
    );

  return (
    <div>
      <legend className="box__legend">{t("Modular sets")}</legend>
      <select value={value} onChange={handleChange}>
        {[
          SUGGESTED,
          FULL_RANDOM,
          RANDOM_REPLACEMENT,
          NONE,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
        ].map((modular) => (
          <option key={modular} value={modular}>
            {t(modular)}
          </option>
        ))}
      </select>

      {!isNaN(value) &&
        new Array(+value).fill(true).map((_, pos) => (
          <div key={pos}>
            <label>
              <span style={{ display: "inline-block", width: "1em" }}>
                {pos + 1}
              </span>
              <select
                value={list[pos]}
                onChange={(e) => handleChangeMod(e, pos)}
              >
                <option value={RANDOM}>⁉️ {t("Random")}</option>
                {selection.modularSets.map((set) => (
                  <option key={set} value={set}>
                    {t(set)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
    </div>
  );
}
