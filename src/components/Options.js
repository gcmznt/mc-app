import { useData } from "../context/data";
import Layout from "./inputs/Layout";
import Theme from "./inputs/Theme";
import LoginForm from "./LoginForm";
import Box from "./ui/Box";
import Option from "./ui/Option";

function SelectAll({ section }) {
  const { fullSelection, selection, updateSelection } = useData();

  const selectAll = (key, unselect) => {
    updateSelection(key, unselect ? [] : fullSelection[key]);
  };

  const isFull = selection[section].length === fullSelection[section].length;

  return (
    <p onClick={() => selectAll(section, isFull)}>
      {isFull ? "Unselect all" : "Select all"}
    </p>
  );
}

export default function Options() {
  const { data, options, selection, updateOption, updateSelection } = useData();

  const toggle = (key, el) => {
    updateSelection(
      key,
      selection[key].includes(el)
        ? selection[key].filter((e) => e !== el)
        : [...selection[key], el]
    );
  };

  return (
    <>
      <Box key="Sync" title="Sync">
        <LoginForm />
      </Box>

      <Box key="Settings" title="Settings" flag flat>
        <legend className="box__legend">Theme</legend>
        <Theme onChange={updateOption} value={options.mode} />

        <legend className="box__legend">Layout</legend>
        <Layout onChange={updateOption} values={options} />
      </Box>

      {[
        { key: "heroes", title: "Heroes", options: data.heroes },
        { key: "scenarios", title: "Scenarios", options: data.scenarios },
        {
          key: "modularSets",
          title: "Modular",
          options: Object.values(data.modularSets),
        },
      ].map((section) => (
        <Box key={section.key} title={section.title} flag flat>
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
