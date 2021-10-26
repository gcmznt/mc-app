import { useMemo } from "react";
import { useData } from "../context/data";
import { EVENTS } from "../utils/constants";
import { getFullSetup } from "../utils/match";
import Status from "./Status";

export default function Match({ matchId, onQuit, setup }) {
  const { data, saveMatch } = useData();

  const save = (data) => {
    window.gtag("event", "result", {
      event_category: "match",
      event_label: data.result,
    });

    saveMatch({
      date: new Date(),
      matchId,
      setup,
      complete: data.log[0].event === EVENTS.END,
      ...data,
    });
  };

  const handleQuit = (data, replay = false) => {
    data && save(data);
    onQuit(replay);
  };

  const fullSetup = useMemo(() => getFullSetup(setup, data), [data, setup]);

  return (
    <Status
      key={matchId}
      matchId={matchId}
      onQuit={handleQuit}
      setup={fullSetup}
    />
  );
}
