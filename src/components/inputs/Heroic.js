import { useTranslation } from "react-i18next";

import { RANDOM } from "../../utils/constants";
import Option from "../ui/Option";

export default function Heroic({ onChange, value }) {
  const { t } = useTranslation();

  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      <legend className="box__legend">{t("Heroic")}</legend>
      {[0, 1, 2, 3, 4, RANDOM].map((heroic) => (
        <Option
          checked={`${heroic}` === value}
          key={heroic}
          label={heroic}
          onChange={handleChange}
          type="radio"
          value={heroic}
          variant="inline"
        />
      ))}
    </div>
  );
}
