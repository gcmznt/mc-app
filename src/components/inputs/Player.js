import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/data";
import { RANDOM } from "../../utils/constants";

export default function Player({ onChange, pos, value }) {
  const { selection } = useData();
  const { t } = useTranslation();

  const handleChange = (e) => onChange(e.target.value);

  useEffect(() => {
    if (value !== RANDOM && !selection.heroes.includes(value)) onChange(RANDOM);
  }, [onChange, selection.heroes, value]);

  return (
    <div>
      <label>
        <span>{t("Player num", { num: pos })}</span>
        <select value={value} onChange={handleChange}>
          <option value={RANDOM}>⁉️ {t("Random")}</option>
          {selection.heroes.map((hero) => (
            <option key={hero} value={hero}>
              {hero}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
