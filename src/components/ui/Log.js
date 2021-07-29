import "../../styles/log.css";

export default function Log({ time, text }) {
  return (
    <div className="log">
      <div className="log__text">{text}</div>
      <small className="log__time">{time.toLocaleTimeString()}</small>
    </div>
  );
}
