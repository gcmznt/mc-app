import { useCallback } from "react";
import Box from "./ui/Box";
import Option from "./ui/Option";

export default function Options({
  data,
  fullSelect,
  onChange,
  onChangeOptions,
  options,
  selection,
}) {
  const toggle = (key, el) => {
    onChange({
      ...selection,
      [key]: selection[key].includes(el)
        ? selection[key].filter((e) => e !== el)
        : [...selection[key], el],
    });
  };

  const selectAll = useCallback(
    (key, unselect) => () => {
      onChange({
        ...selection,
        [key]: unselect ? [] : fullSelect[key],
      });
    },
    [fullSelect, onChange, selection]
  );

  const SelectAll = useCallback(
    ({ items }) =>
      selection[items].length === fullSelect[items].length ? (
        <div onClick={selectAll(items, true)}>Unselect all</div>
      ) : (
        <div onClick={selectAll(items)}>Select all</div>
      ),
    [fullSelect, selectAll, selection]
  );

  return (
    <>
      <Box title="Theme" flag flat>
        <Option
          checked={options.mode === "auto"}
          label="System default"
          type="radio"
          onChange={() => onChangeOptions("mode")("auto")}
        />
        <Option
          checked={options.mode === "dark"}
          label="Dark theme"
          type="radio"
          onChange={() => onChangeOptions("mode")("dark")}
        />
        <Option
          checked={options.mode === "light"}
          label="Light theme"
          type="radio"
          onChange={() => onChangeOptions("mode")("light")}
        />
      </Box>
      <Box title="Settings" flag flat>
        <Option
          checked={options.timer}
          label="Timer"
          onChange={(e) => onChangeOptions("timer")(e.target.checked)}
        />
      </Box>
      <Box title="Heroes" flag flat>
        {data.heroes.map((opt) => (
          <Option
            key={opt.name}
            checked={selection.heroes.includes(opt.name)}
            flag={opt.pack !== opt.name && opt.pack}
            label={opt.name}
            onChange={(e) => toggle("heroes", e.target.value)}
            value={opt.name}
          />
        ))}
        <SelectAll items="heroes" />
      </Box>
      <Box title="Scenarios" flag flat>
        {data.scenarios.map((opt) => (
          <Option
            key={opt.name}
            checked={selection.scenarios.includes(opt.name)}
            flag={opt.pack !== opt.name && opt.pack}
            label={opt.name}
            onChange={(e) => toggle("scenarios", e.target.value)}
            value={opt.name}
          />
        ))}
        <SelectAll items="scenarios" />
      </Box>
      <Box title="Modular" flag flat>
        {Object.values(data.modularSets).map((opt) => (
          <Option
            key={opt.name}
            checked={selection.modularSets.includes(opt.name)}
            flag={opt.pack !== opt.name && opt.pack}
            label={opt.name}
            onChange={(e) => toggle("modularSets", e.target.value)}
            value={opt.name}
          />
        ))}
        <SelectAll items="modularSets" />
      </Box>
    </>
  );
}
