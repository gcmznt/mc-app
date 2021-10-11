import { useEffect, useState } from "react";

export default function useWakeLock() {
  const [wakeLock, setWakeLock] = useState(false);

  const enable = () => {
    if ("wakeLock" in navigator) {
      navigator.wakeLock
        .request("screen")
        .then(setWakeLock)
        .catch(console.error);
    }
  };

  const disable = () => {
    if ("wakeLock" in navigator) {
      wakeLock.release().then(() => setWakeLock(false));
    }
  };

  useEffect(() => {
    const resetLock = () => {
      if (wakeLock !== false && document.visibilityState === "visible") {
        navigator.wakeLock
          .request("screen")
          .then(setWakeLock)
          .catch(console.error);
      }
    };
    document.addEventListener("visibilitychange", resetLock);

    return () => document.removeEventListener("visibilitychange", resetLock);
  }, [wakeLock]);

  return { disable, enable };
}
