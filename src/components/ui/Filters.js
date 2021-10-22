import { useTranslation } from "react-i18next";

import "../../styles/filters.css";
import { FILTERS } from "../../utils/constants";
import { resultText } from "../../utils/texts";

export default function Filters({ filters, onToggle }) {
  const { t } = useTranslation();

  return (
    !!filters.length && (
      <div className="filters">
        {t("Filters")}:
        {filters.map((f) => (
          <span
            key={f[0] + f[1]}
            className={`filters__element is-${f[0]}`}
            onClick={() => onToggle(f)}
          >
            {f[0] === FILTERS.RESULT
              ? t(resultText(f[1]))
              : f[0] === FILTERS.PLAYERS
              ? t("Players num", { numPlayers: f[1] })
              : t(f[1])}
          </span>
        ))}
      </div>
    )
  );
}
