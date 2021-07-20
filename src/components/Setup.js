export default function Setup({ setup }) {
  return (
    <div>
      <div>
        {setup.heroes.map((hero, i) => (
          <div key={hero.name}>
            {hero.aspects.map((a) => (
              <div key={a} className={`aspect is-${a.toLowerCase()}`}></div>
            ))}
            {hero.name}
          </div>
        ))}
      </div>
      <div className="vs">VS</div>
      <div>{setup.scenario.name}</div>
      <div>{setup.scenario.modular.map((m) => m.name)}</div>
    </div>
  );
}
