import { useEffect, useState } from "react";
import { useData } from "../context/data";
import "../styles/timer.css";
import { msToTime } from "../utils";

const UPDATE_INTERVAL =
  new URL(document.location).searchParams.get("debug") === "" ? 25000 : 250;

export default function Timer({ disabled, interacted, onChange, time }) {
  const [active, setActive] = useState(true);
  const { options } = useData();

  useEffect(() => {
    const advance = () => onChange((t) => t + UPDATE_INTERVAL);

    if (active && !disabled) {
      const to = setInterval(advance, UPDATE_INTERVAL);
      return () => clearInterval(to);
    }
  }, [active, disabled, onChange]);

  useEffect(() => {
    const toggleTimer = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", toggleTimer);

    return () => document.removeEventListener("visibilitychange", toggleTimer);
  }, []);

  useEffect(() => {
    if (interacted && window.navigator.vibrate) {
      window.navigator.vibrate([50, 100, 50, 100, 200]);
    }
  }, [active, interacted]);

  return options.timer ? <div className="timer">{msToTime(time)}</div> : null;
}
