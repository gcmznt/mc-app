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
      <div>
        {setup.scenario.name} [{setup.mode}]
      </div>
      <div>{setup.scenario.modular.map((m) => m.name).join(" + ")}</div>
    </>
  );
}
