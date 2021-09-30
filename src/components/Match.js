import { useEffect, useMemo, useState } from "react";
import { useData } from "../context/data";
import { append, load } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";
import Status from "./Status";

export default function Match({ matchId, onReplay, onQuit, options, setup }) {
  const [result, setResult] = useState(null);
  const { data, saveMatch } = useData();

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

      saveMatch({
        date: new Date(),
        matchId,
        setup,
        ...(res || result),
      });
      append(STORAGE_KEYS.TO_SYNC, matchId);
    }
  };

  const handleQuit = (res) => {
    save(res);
    onQuit();
  };

  const handleReplay = (res) => {
    save(res);
    onReplay();
  };

  const fullSetup = useMemo(() => {
    const getSideSchemes = (el) => [
      ...(el?.sideSchemes || []).map((s) => data.schemes[s]),
      ...(el?.nemesisSchemes || []).map((s) => data.schemes[s]),
    ];

    const addSideSchemes = (el) => ({
      ...el,
      sideSchemes: getSideSchemes(el),
    });

    const scenarioData = data.scenarios.find(
      (s) => s.name === setup.scenarioName
    );

    return {
      ...setup,
      heroes: setup.heroes
        ? setup.heroes
        : setup.heroesAndAspects
            .map((hero) => ({
              ...data.heroes.find((h) => h.name === hero.name),
              aspects: hero.aspects,
            }))
            .map(addSideSchemes),
      scenario: setup.scenario
        ? setup.scenario
        : {
            ...scenarioData,
            sideSchemes: getSideSchemes(scenarioData),
            mainScheme: scenarioData.mainScheme.map((s) => ({
              ...data.schemes[s],
              children: (data.schemes[s].children || []).map(
                (c) => data.schemes[c]
              ),
            })),
            modular: setup.modularSets
              .map((m) => data.modularSets[m])
              .map(addSideSchemes),
          },
    };
  }, [data, setup]);

  useEffect(() => {
    setResult(load(STORAGE_KEYS.CURRENT)?.result || false);
  }, []);

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
        setup={fullSetup}
      />
    )
  );
}
