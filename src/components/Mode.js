import { MODES, RANDOM } from "../utils/constants";
import Option from "./ui/Option";

export default function Mode({ onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {[...MODES, RANDOM].map((mode) => (
        <Option
          key={mode}
          checked={mode === value}
          label={mode}
          value={mode}
          type="radio"
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
