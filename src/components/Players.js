import Option from "./ui/Option";

export default function Players({ max, onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {[1, 2, 3, 4].map((num) => (
        <Option
          key={num}
          checked={+num === +value}
          label={num}
          value={num}
          type="radio"
          disabled={num > max}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
