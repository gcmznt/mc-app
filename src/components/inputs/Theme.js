import Option from "../ui/Option";

export default function Theme({ onChange, value }) {
  return (
    <div>
      {[
        { key: "auto", label: "System" },
        { key: "dark", label: "Dark" },
        { key: "light", label: "Light" },
      ].map((opt) => (
        <Option
          key={opt.key}
          checked={value === opt.key}
          label={opt.label}
          type="radio"
          onChange={() => onChange("mode", opt.key)}
          variant="inline"
        />
      ))}
    </div>
  );
}
