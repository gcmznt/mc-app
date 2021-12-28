import { useTranslation } from "react-i18next";

import { useData } from "../context/data";
import Language from "./inputs/Language";
import Layout from "./inputs/Layout";
import Theme from "./inputs/Theme";
// import DeviceSpace from "./DeviceSpace";
import LoginForm from "./LoginForm";
import Box from "./ui/Box";
import Option from "./ui/Option";

function SelectAll({ section }) {
  const { t } = useTranslation();
  const { fullSelection, selection, updateSelection } = useData();

  const selectAll = (key, unselect) => {
    updateSelection(key, unselect ? [] : fullSelection[key]);
  };

  const isFull = selection[section].length === fullSelection[section].length;

  return (
    <p onClick={() => selectAll(section, isFull)}>
      {t(isFull ? "Unselect all" : "Select all")}
    </p>
  );
}

export default function Options() {
  const { t } = useTranslation();
  const { data, options, selection, updateOption, updateSelection } = useData();

  const toggle = (key, el) => {
    updateSelection(
      key,
      selection[key].includes(el)
        ? selection[key].filter((e) => e !== el)
        : [...selection[key], el]
    );
  };

  return !options ? null : (
    <>
      <Box key="Sync" title={t("Account")}>
        <LoginForm />
      </Box>

      {/* <Box key="Space" title={t("Used device space")} flag>
        <DeviceSpace />
      </Box> */}

      <Box key="Settings" title={t("Settings")} flag flat>
        <legend className="box__legend">{t("Random")}</legend>
        <Option
          checked={options.randomWeighted}
          label="Heroes and scenario weighted random"
          onChange={(e) => updateOption("randomWeighted", e.target.checked)}
        />

        <legend className="box__legend">{t("Language")}</legend>
        <Language onChange={updateOption} value={options.language} />

        <legend className="box__legend">{t("Theme")}</legend>
        <Theme onChange={updateOption} value={options.mode} />

        <legend className="box__legend">{t("Layout")}</legend>
        <Layout onChange={updateOption} values={options} />
      </Box>

      {[
        { key: "heroes", title: "Heroes", options: data.heroes },
        { key: "scenarios", title: "Scenarios", options: data.scenarios },
        {
          key: "modularSets",
          title: "Modular sets",
          options: Object.values(data.modularSets),
        },
      ].map((section) => (
        <Box key={section.key} title={t(section.title)} flag flat>
          {section.options.map((opt) => (
            <Option
              key={opt.name}
              checked={selection[section.key].includes(opt.name)}
              flag={opt.pack !== opt.name && opt.pack}
              label={opt.name}
              onChange={(e) => toggle(section.key, e.target.value)}
              value={opt.name}
            />
          ))}
          <SelectAll section={section.key} />
        </Box>
      ))}
    </>
  );
}
