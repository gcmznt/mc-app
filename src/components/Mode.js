import { MODES, RANDOM } from "../utils/constants";

export default function Mode({ onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {[...MODES, RANDOM].map((mode) => (
        <label key={mode}>
          <input
            checked={mode === value}
            onChange={handleChange}
            type="radio"
            value={mode}
          />{" "}
          {mode}
        </label>
      ))}
    </div>
  );
}
