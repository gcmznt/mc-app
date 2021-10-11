import { RANDOM } from "../../utils/constants";
import Option from "../ui/Option";

export default function Skirmish({ onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      <legend className="box__legend">Skirmish</legend>
      {["None", 1, 2, 3, RANDOM].map((skirmish) => (
        <Option
          checked={`${skirmish}` === value}
          key={skirmish}
          label={skirmish}
          onChange={handleChange}
          type="radio"
          value={skirmish}
          variant="inline"
        />
      ))}
    </div>
  );
}
