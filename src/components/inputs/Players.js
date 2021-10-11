import Option from "../ui/Option";

export default function Players({ max, onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {[1, 2, 3, 4].map((num) => (
        <Option
          checked={+num === +value}
          disabled={num > max}
          key={num}
          label={num}
          onChange={handleChange}
          type="radio"
          value={num}
          variant="inline"
        />
      ))}
    </div>
  );
}
