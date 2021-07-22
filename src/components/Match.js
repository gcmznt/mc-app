import { useEffect, useState } from "react";
import Setup from "./Setup";
import Status from "./Status";
import Box from "./ui/Box";

export default function Match({ onQuit, onStart, initialSetup, started }) {
  const [result, setResult] = useState(null);
  const handleResult = (reason, counters) => setResult(reason);

  useEffect(() => {
    setResult(JSON.parse(localStorage.getItem("current"))?.result || false);
  }, []);

  return (
    result !== null &&
    (!started ? (
      <>
        <Box>
          <Setup setup={initialSetup} />
        </Box>
        <div>
          <button onClick={onStart}>Start</button>
        </div>
      </>
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
