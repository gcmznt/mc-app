import { useEffect, useState } from "react";
import { append, load } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";
import Status from "./Status";

export default function Match({ matchId, onQuit, setup }) {
  const [result, setResult] = useState(null);

  const handleResult = (reason, counters, log) => {
    if (reason) {
      append(STORAGE_KEYS.MATCHES, { counters, log, matchId, reason, setup });
    }
    setResult(reason);
  };

  useEffect(() => {
    setResult(load(STORAGE_KEYS.CURRENT)?.result || false);
  }, []);

  return (
    result !== null && (
      <Status
        matchId={matchId}
        onResult={handleResult}
        onQuit={onQuit}
        result={result}
        setup={setup}
      />
    )
  );
}
