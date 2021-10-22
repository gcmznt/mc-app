import Dot from "./Dot";
import "../../styles/setup.css";

export default function Setup({ setup }) {
  return (
    <div className="setup">
      <div className="setup__heroes">
        {setup.heroesAndAspects.map((hero, i) => (
          <div key={hero.name} className="setup__hero">
            {hero.aspects.map((a) => (
              <Dot key={a} type={a.toLowerCase()} />
            ))}
            {hero.name}
          </div>
        ))}
      </div>
      <div className="setup__vs">VS</div>
      <div className="setup__scenario">{setup.scenarioName}</div>
      <div className="setup__scenario-info">
        {setup.mode} | Heroic: {setup.heroic}
        {setup.skirmish !== "None" ? ` | Skirmish level ${setup.skirmish}` : ""}
      </div>
      <div>{setup.modularSets.join(" + ")}</div>
    </div>
  );
}
