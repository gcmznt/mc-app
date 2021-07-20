export default function SelectHeroes({ heroes, heroList, onChange }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {heroes.map((hero) => (
        <label className="option" key={hero.name}>
          <input
            checked={heroList.some((h) => h.name === hero.name)}
            onChange={handleChange}
            type="checkbox"
            value={hero.name}
          />{" "}
          {hero.name} {hero.pack !== hero.name && <span>{hero.pack}</span>}
        </label>
      ))}
    </div>
  );
}
