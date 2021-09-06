import Dot from "./Dot";

export default function Setup({ setup }) {
  return (
    <>
      {setup.heroes.map((hero, i) => (
        <div key={hero.name}>
          {hero.aspects.map((a) => (
            <Dot key={a} type={a.toLowerCase()} />
          ))}
          {hero.name}
        </div>
      ))}
      <div className="vs">VS</div>
      <div>{setup.scenario.name}</div>
      <div>{setup.scenario.modular.map((m) => m.name).join(" + ")}</div>
      <div>
        {setup.mode} | Heroic: {setup.heroic}
        {/* {setup.skirmish !== "None" ? ` | Skirmish level ${setup.skirmish}` : ""} */}
      </div>
    </>
  );
}
