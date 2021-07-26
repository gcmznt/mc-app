import Box from "./ui/Box";
import Option from "./ui/Option";

export default function Options({
  changeMode,
  data,
  mode,
  onChange,
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

  return (
    <>
      <Box title="Theme" flag flat>
        <Option
          checked={mode === "auto"}
          label="System default"
          type="radio"
          onChange={() => changeMode("auto")}
        />
        <Option
          checked={mode === "dark"}
          label="Dark theme"
          type="radio"
          onChange={() => changeMode("dark")}
        />
        <Option
          checked={mode === "light"}
          label="Light theme"
          type="radio"
          onChange={() => changeMode("light")}
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
      </Box>
    </>
  );
}
