import { useEffect } from "react";
import "../../styles/modal.css";

export default function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  const handleClose = (e) => {
    if (e.target.classList.contains("modal")) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleClose}>
      <div className="modal__close" onClick={onClose} />
      <div>{children}</div>
    </div>
  );
}
