import { useEffect, useState } from "react";
import Setup from "./Setup";
import Status from "./Status";

export default function Match({ onQuit, onStart, initialSetup, started }) {
  const [result, setResult] = useState(null);
  const handleResult = (reason, counters) => setResult(reason);

  useEffect(() => {
    setResult(JSON.parse(localStorage.getItem("current"))?.result || false);
  }, []);

  return (
    result !== null &&
    (!started ? (
      <div>
        <div className="box">
          <div className="box__content">
            <Setup setup={initialSetup} />
          </div>
        </div>
        <div>
          <button onClick={onStart}>Start</button>
        </div>
      </div>
    ) : (
      <Status
        onResult={handleResult}
        onQuit={onQuit}
        result={result}
        setup={initialSetup}
      />
    ))
  );
}
