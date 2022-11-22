const getSideSchemes = (el) => [
  ...(el?.sideSchemes || []),
  ...(el?.nemesisSchemes || []),
];

export function getFullSetup(setup, data) {
  const getSideSchemeData = (s) => data.sideSchemes[s];
  const getMainSchemeData = (s) => ({ ...data.mainSchemes[s] });
  const getModularData = (m) => data.modularSets[m];

  const addSideSchemes = (el) => ({
    ...el,
    sideSchemes: getSideSchemes(el).map(getSideSchemeData),
  });

  const getHeroData = (hero) => ({
    ...data.getHero(hero.key || hero.name),
    aspects: hero.aspects,
  });

  const getHeroesData = (heroes) => heroes.map(getHeroData).map(addSideSchemes);

  const getScenarioData = (name) => {
    const scenarioData = data.scenarios.find((s) => s.name === name);

    return {
      ...scenarioData,
      sideSchemes: getSideSchemes(scenarioData).map(getSideSchemeData),
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
