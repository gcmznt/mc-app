import "../../styles/log.css";

export default function LogItem({ text, time }) {
  return (
    <div className="log">
      <div className="log__text">{text}</div>
      {time && <small className="log__time">{time}</small>}
    </div>
  );
}
