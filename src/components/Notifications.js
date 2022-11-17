import { useNotifications } from "../context/notifications";
import "../styles/notifications.css";

export default function Notifications() {
  const { notifications } = useNotifications();

  return (
    <div className="notifications">
      {notifications.map(({ id, text, type }, i) => (
        <div
          key={id}
          className={`notifications__item is-${type}`}
          style={{ "--position": i }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}
