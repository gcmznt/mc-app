import { useTranslation } from "react-i18next";
import { useData } from "../../context/data";
import { RANDOM } from "../../utils/constants";

export default function Scenario({ onChange, value }) {
  const { selection } = useData();
  const { t } = useTranslation();

  const byName = (a, b) => t(a).localeCompare(t(b));
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      <select value={value} onChange={handleChange}>
        <option value={RANDOM}>⁉️ {t("Random")}</option>
        {selection.scenarios.sort(byName).map((scenario) => (
          <option key={scenario} value={scenario}>
            {t(scenario)}
          </option>
        ))}
      </select>
    </div>
  );
}
