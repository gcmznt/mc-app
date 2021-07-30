import { useEffect, useState } from "react";
import "../styles/timer.css";

export default function Timer({ disabled, time, onChange }) {
  const [active, setActive] = useState(true);

  const toggleTimer = () => setActive((f) => !f);

  useEffect(() => {
    const advance = () => onChange((t) => t + 100);

    if (active && !disabled) {
      const to = setInterval(advance, 100);
      return () => clearInterval(to);
    }
  }, [active, disabled, onChange]);

  useEffect(() => {
    const toggleTimer = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", toggleTimer);

    return () => document.removeEventListener("visibilitychange", toggleTimer);
  }, []);

  useEffect(() => {
    window.navigator.vibrate([50, 100, 50, 100, 200]);
  }, [active]);

  const seconds = Math.floor(time / 1000);

  return (
    <div className="timer" onClick={toggleTimer}>
      {Math.floor(seconds / 60)}:
      {seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}
    </div>
  );
}
