import Box from "./ui/Box";
import Option from "./ui/Option";

export default function Options({ data, onChange, selection }) {
  const toggle = (key, el) => {
    onChange({
      ...selection,
      [key]: selection[key].some((e) => e.name === el)
        ? selection[key].filter((e) => e.name !== el)
        : [...selection[key], data[key].find((e) => e.name === el)],
    });
  };

  return (
    <>
      <Box title="Heroes" flag flat>
        {data.heroes.map((hero) => (
          <Option
            key={hero.name}
            checked={selection.heroes.some((h) => h.name === hero.name)}
            flag={hero.pack !== hero.name && hero.pack}
            label={hero.name}
            onChange={(e) => toggle("heroes", e.target.value)}
            value={hero.name}
          />
        ))}
      </Box>
      <Box title="Scenarios" flag flat>
        {data.scenarios.map((scenario) => (
          <Option
            key={scenario.name}
            checked={selection.scenarios.some((s) => s.name === scenario.name)}
            flag={scenario.pack !== scenario.name && scenario.pack}
            label={scenario.name}
            onChange={(e) => toggle("scenarios", e.target.value)}
            value={scenario.name}
          />
        ))}
      </Box>
    </>
  );
}
