import { useState } from "react";
import Setup from "./Setup";
import Status from "./Status";

export default function Match({ onQuit, onStart, initialSetup, started }) {
  const [result, setResult] = useState(false);
  const handleResult = (reason, counters) => setResult(reason);

  return !started ? (
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
  );
}
