import Option from "../ui/Option";

export default function Layout({ onChange, values }) {
  return (
    <div>
      {[
        { key: "timer", label: "Show match timer" },
        { key: "compact", label: "Use compact layout" },
      ].map((opt) => (
        <Option
          key={opt.key}
          checked={values[opt.key]}
          label={opt.label}
          onChange={(e) => onChange(opt.key, e.target.checked)}
        />
      ))}
    </div>
  );
}
