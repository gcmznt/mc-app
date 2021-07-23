import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";
import Status from "./Status";

export default function Match({ initialSetup, onQuit }) {
  const [result, setResult] = useState(null);
  const handleResult = (reason, counters) => setResult(reason);

  useEffect(() => {
    setResult(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT))?.result || false
    );
  }, []);

  return (
    result !== null && (
      <Status
        onResult={handleResult}
        onQuit={onQuit}
        result={result}
        setup={initialSetup}
      />
    )
  );
}
