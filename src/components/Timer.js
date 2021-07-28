import { useEffect, useState } from "react";

export default function Timer({ time, onChange }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const advance = () => onChange((t) => t + 100);

    if (active) {
      const to = setInterval(advance, 100);
      return () => clearInterval(to);
    }
  }, [active, onChange]);

  useEffect(() => {
    const toggleTimer = () => {
      console.log(document.visibilityState);
      setActive(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", toggleTimer);

    return () => {
      document.removeEventListener("visibilitychange", toggleTimer);
    };
  }, []);

  const seconds = Math.floor(time / 1000);

  return (
    <div>
      {Math.floor(seconds / 60)}:
      {seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}
    </div>
  );
}
