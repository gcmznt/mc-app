import "../../styles/status.css";

export default function Status({ onToggle, status }) {
  const toggle = (key) => {
    onToggle && onToggle(key, !status[key]);
  };

  return (
    <div className="status">
      {Object.keys(status).map((st) => (
        <div
          className={`status__toggle is-${st.toLowerCase()} ${
            status[st] ? "is-active" : ""
          }`}
          onClick={() => toggle(st)}
          key={st}
        >
          {st}
        </div>
      ))}
    </div>
  );
}
