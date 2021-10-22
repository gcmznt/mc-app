import i18n from "../../i18n";

import Option from "../ui/Option";

export default function Language({ onChange, value }) {
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    onChange("language", lng);
  };

  return (
    <div>
      {[
        { key: "en", label: "English" },
        { key: "it", label: "Italiano" },
      ].map((opt) => (
        <Option
          key={opt.key}
          checked={value === opt.key}
          label={opt.label}
          type="radio"
          onChange={() => changeLanguage(opt.key)}
          variant="inline"
        />
      ))}
    </div>
  );
}
