// import { useEffect } from "react";
import SelectHeroes from "./SelectHeroes";
import SelectScenarios from "./SelectScenarios";

export default function Options({ data, onChange, selection }) {
  const toggle = (key) => (el) => {
    onChange({
      ...selection,
      [key]: selection[key].some((e) => e.name === el)
        ? selection[key].filter((e) => e.name !== el)
        : [...selection[key], data[key].find((e) => e.name === el)],
    });
  };

  return (
    <div>
      <div className="box box--flag box--flat">
        <div className="box__title">Heroes</div>
        <div className="box__content">
          <SelectHeroes
            heroes={data.heroes}
            heroList={selection.heroes}
            onChange={toggle("heroes")}
          />
        </div>
      </div>
      <div className="box box--flag box--flat">
        <div className="box__title">Scenarios</div>
        <div className="box__content">
          <SelectScenarios
            scenarios={data.scenarios}
            scenarioList={selection.scenarios}
            onChange={toggle("scenarios")}
          />
        </div>
      </div>
    </div>
  );
}
