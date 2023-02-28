export function getFullSetup(setup, data) {
  const getMainSchemeData = (s) => ({ ...data.mainSchemes[s] });
  const getModularData = (m) => data.modularSets[m];

  const getHeroData = (hero) => ({
    ...data.getHero(hero.key || hero.name),
    aspects: hero.aspects,
  });

  const getHeroesData = (heroes) => heroes.map(getHeroData);

  const getScenarioData = (name) => {
    const scenarioData = data.getScenario(name);

    return {
      ...scenarioData,
      mainScheme: scenarioData.mainScheme.map(getMainSchemeData),
      modular: setup.modularSets.map(getModularData),
    };
  };

  return {
    ...setup,
    heroes: setup.heroes || getHeroesData(setup.heroesAndAspects),
    scenario: setup.scenario || getScenarioData(setup.scenarioName),
  };
}
