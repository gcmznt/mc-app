import "../../styles/dot.css";
import { getClassName } from "../../utils";

export default function Dot({ small, type }) {
  const classList = ["dot", `is-${type.toLowerCase()}`, small && "is-small"];

  return <div className={getClassName(classList)} />;
}
