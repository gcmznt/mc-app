import Box from "./ui/Box";
import Option from "./ui/Option";

export default function Options({ data, onChange, selection }) {
  const toggle = (key, el) => {
    onChange({
      ...selection,
      [key]: selection[key].includes(el)
        ? selection[key].filter((e) => e !== el)
        : [...selection[key], el],
    });
  };

  return [
    { key: "heroes", label: "Heroes" },
    { key: "scenarios", label: "Scenarios" },
  ].map((section) => (
    <Box key={section.key} title={section.label} flag flat>
      {data[section.key].map((opt) => (
        <Option
          key={opt.name}
          checked={selection[section.key].includes(opt.name)}
          flag={opt.pack !== opt.name && opt.pack}
          label={opt.name}
          onChange={(e) => toggle(section.key, e.target.value)}
          value={opt.name}
        />
      ))}
    </Box>
  ));
}
