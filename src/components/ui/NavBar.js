import "../../styles/navbar.css";
import { getClassName } from "../../utils";

export default function Navbar({ children, types }) {
  const classList = ["navbar", ...(types || []).map((t) => `is-${t}`)];

  return <div className={getClassName(classList)}>{children}</div>;
}
