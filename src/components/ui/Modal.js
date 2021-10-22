import { useEffect } from "react";
import "../../styles/modal.css";

export default function Modal({ children, ...props }) {
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  return (
    <div className="modal" {...props}>
      {children}
    </div>
  );
}
