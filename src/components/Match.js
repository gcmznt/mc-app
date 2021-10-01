import { useMemo } from "react";
import { useData } from "../context/data";
import { append } from "../utils";
import { EVENTS, STORAGE_KEYS } from "../utils/constants";
import Status from "./Status";

export default function Match({ matchId, onReplay, onQuit, options, setup }) {
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
    append(STORAGE_KEYS.TO_SYNC, matchId);
  };

  const handleQuit = (data) => {
    data && save(data);
    onQuit();
  };

  const handleReplay = (data) => {
    save(data);
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

  return (
    <Status
      key={matchId}
      matchId={matchId}
      onReplay={handleReplay}
      onQuit={handleQuit}
      options={options}
      setup={fullSetup}
    />
  );
}
