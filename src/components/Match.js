import { useEffect, useState } from "react";
import { append, load } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";
import Status from "./Status";

export default function Match({ matchId, onQuit, options, setup }) {
  const [result, setResult] = useState(null);

  const handleResult = (reason, counters, log, quit = false) => {
    setResult(reason ? { reason, counters, log } : false);
    if (quit) handleQuit(reason ? { reason, counters, log } : false);
  };

  const handleQuit = (res) => {
    window.gtag("event", "result", {
      event_category: "match",
      event_label: result.reason,
    });

    if (res || result)
      append(STORAGE_KEYS.MATCHES, {
        date: new Date(),
        matchId,
        setup,
        ...(res || result),
      });
    onQuit();
  };

  useEffect(() => {
    setResult(load(STORAGE_KEYS.CURRENT)?.result || false);
  }, []);

  return (
    result !== null && (
      <Status
        matchId={matchId}
        onResult={handleResult}
        onQuit={handleQuit}
        options={options}
        result={result.reason}
        setup={setup}
      />
    )
  );
}
