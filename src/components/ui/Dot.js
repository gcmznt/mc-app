import "../../styles/dot.css";

export default function Dot({ small, type }) {
  return (
    <div
      className={`dot is-${type.toLowerCase()} ${small ? "is-small" : ""}`}
    />
  );
}
