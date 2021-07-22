import "../../styles/fab.css";

export default function Fab({ label, onClick }) {
  return (
    <div className="fab" onClick={onClick}>
      {label}
    </div>
  );
}
