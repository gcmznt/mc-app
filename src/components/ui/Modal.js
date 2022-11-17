import { useEffect, useState } from "react";
import "../../styles/modal.css";

export default function Modal({ children, onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  const handleClose = (e) => {
    setClosing(true);
    setTimeout(onClose, 500);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal")) {
      handleClose();
    }
  };

  return (
    <div
      className={`modal ${closing ? "is-closing" : ""}`}
      onClick={handleBackdropClick}
    >
      <div className="modal__close" onClick={handleClose} />
      <div className="modal__content">{children}</div>
    </div>
  );
}
