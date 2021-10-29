const getSideSchemes = (el) => [
  ...(el?.sideSchemes || []),
  ...(el?.nemesisSchemes || []),
];

const getMinions = (el) => [...(el?.minions || []), ...(el?.nemesis || [])];

export function getFullSetup(setup, data) {
  const getSchemeData = (name) => data.schemes[name];
  const getMinionData = (name) => data.minions[name];
  const getModularData = (name) => data.modularSets[name];

  const addExtras = (el) => ({
    ...el,
    sideSchemes: getSideSchemes(el).map(getSchemeData),
    minions: getMinions(el).map(getMinionData),
  });

  const getHeroData = (hero) => ({
    ...data.heroes.find((h) => h.name === hero.name),
    aspects: hero.aspects,
  });

  const getHeroesData = (heroes) => heroes.map(getHeroData).map(addExtras);

  const getScenarioData = (name) => {
    const scenarioData = data.scenarios.find((s) => s.name === name);

    return {
      ...scenarioData,
      sideSchemes: getSideSchemes(scenarioData).map(getSchemeData),
      mainScheme: scenarioData.mainScheme.map(getSchemeData),
      modular: setup.modularSets.map(getModularData).map(addExtras),
      minions: scenarioData.minions.map(getMinionData),
    };
  };

  return {
    ...setup,
    heroes: setup.heroes || getHeroesData(setup.heroesAndAspects),
    scenario: setup.scenario || getScenarioData(setup.scenarioName),
  };
}
