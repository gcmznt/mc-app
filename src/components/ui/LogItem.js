import "../../styles/log.css";
import { msToTime } from "../../utils";

export default function LogItem({ text, time }) {
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
