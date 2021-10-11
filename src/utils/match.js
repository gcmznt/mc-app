const getSideSchemes = (el) => [
  ...(el?.sideSchemes || []),
  ...(el?.nemesisSchemes || []),
];

export function getFullSetup(setup, data) {
  const getSchemeData = (s) => data.schemes[s];
  const getModularData = (m) => data.modularSets[m];

  const addSideSchemes = (el) => ({
    ...el,
    sideSchemes: getSideSchemes(el).map(getSchemeData),
  });

  const getHeroData = (hero) => ({
    ...data.heroes.find((h) => h.name === hero.name),
    aspects: hero.aspects,
  });

  const getHeroesData = (heroes) => heroes.map(getHeroData).map(addSideSchemes);

  const getMainSchemeData = (s) => ({
    ...data.schemes[s],
    children: (data.schemes[s].children || []).map(getSchemeData),
  });

  const getScenarioData = (name) => {
    const scenarioData = data.scenarios.find((s) => s.name === name);

    return {
      ...scenarioData,
      sideSchemes: getSideSchemes(scenarioData).map(getSchemeData),
      mainScheme: scenarioData.mainScheme.map(getMainSchemeData),
      modular: setup.modularSets.map(getModularData).map(addSideSchemes),
    };
  };

  return {
    ...setup,
    heroes: setup.heroes || getHeroesData(setup.heroesAndAspects),
    scenario: setup.scenario || getScenarioData(setup.scenarioName),
  };
}
