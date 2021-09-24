import "../../styles/log.css";

const minutes = (time) => `${Math.floor(time / 1000 / 60)}`;
const seconds = (time) => `${Math.floor(time / 1000) % 60}`;

export default function Log({ time, text }) {
  return (
    <div className="log">
      <div className="log__text">{text}</div>
      {time && (
        <small className="log__time">
          {time instanceof Date
            ? time.toLocaleTimeString()
            : `+ ${minutes(time)}:${seconds(time).padStart(2, "0")}`}
        </small>
      )}
    </div>
  );
}
