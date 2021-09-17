import { useEffect, useState } from "react";
import { append, load } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";
import Status from "./Status";

export default function Match({ matchId, onReplay, onQuit, options, setup }) {
  const [result, setResult] = useState(null);

  const handleResult = (reason, counters, log, quit = false) => {
    setResult(reason ? { reason, counters, log } : false);
    if (quit) handleQuit(reason ? { reason, counters, log } : false);
  };

  const save = (res) => {
    if (res || result) {
      window.gtag("event", "result", {
        event_category: "match",
        event_label: result.reason,
      });

      append(STORAGE_KEYS.MATCHES, {
        date: new Date(),
        matchId,
        setup,
        ...(res || result),
      });
    }
  };

  const handleQuit = (res) => {
    console.log("handleQuit", res, result, setup);
    save(res);
    onQuit();
  };

  const handleReplay = (res) => {
    console.log("handleReplay", res, result, setup);
    save(res);
    onReplay();
  };

  useEffect(() => {
    setResult(load(STORAGE_KEYS.CURRENT)?.result || false);
  }, []);

  console.log(matchId, setup);

  return (
    result !== null && (
      <Status
        key={matchId}
        matchId={matchId}
        onReplay={handleReplay}
        onResult={handleResult}
        onQuit={handleQuit}
        options={options}
        result={result.reason}
        setup={setup}
      />
    )
  );
}
