import "../../styles/dot.css";

export default function Dot({ type }) {
  return <div className={`dot is-${type.toLowerCase()}`} />;
}
