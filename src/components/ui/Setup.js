import Dot from "./Dot";

export default function Setup({ setup }) {
  return (
    <>
      {setup.heroesAndAspects.map((hero, i) => (
        <div key={hero.name}>
          {hero.aspects.map((a) => (
            <Dot key={a} type={a.toLowerCase()} />
          ))}
          {hero.name}
        </div>
      ))}
      <div className="vs">VS</div>
      <div>{setup.scenarioName}</div>
      <div>{setup.modularSets.join(" + ")}</div>
      <div>
        {setup.mode} | Heroic: {setup.heroic}
        {setup.skirmish !== "None" ? ` | Skirmish level ${setup.skirmish}` : ""}
      </div>
    </>
  );
}
