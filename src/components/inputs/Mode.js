import { MODES, RANDOM } from "../../utils/constants";
import Option from "../ui/Option";

export default function Mode({ onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {[...MODES, RANDOM].map((mode) => (
        <Option
          checked={mode === value}
          key={mode}
          label={mode}
          onChange={handleChange}
          type="radio"
          value={mode}
          variant="inline"
        />
      ))}
    </div>
  );
}
