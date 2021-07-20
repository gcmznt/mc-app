export default function SelectScenarios({ scenarios, scenarioList, onChange }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {scenarios.map((scenario) => (
        <div key={scenario.name}>
          <label>
            <input
              checked={scenarioList.some((s) => s.name === scenario.name)}
              onChange={handleChange}
              type="checkbox"
              value={scenario.name}
            />{" "}
            {scenario.name} [{scenario.pack}]
          </label>
        </div>
      ))}
    </div>
  );
}
