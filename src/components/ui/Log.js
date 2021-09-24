import "../../styles/log.css";
import { msToTime } from "../../utils";

export default function Log({ time, text }) {
  return (
    <div className="log">
      <div className="log__text">{text}</div>
      {time && (
        <small className="log__time">
          {time instanceof Date
            ? time.toLocaleTimeString()
            : `+ ${msToTime(time)}`}
        </small>
      )}
    </div>
  );
}
