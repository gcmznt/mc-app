export default function Players({ max, onChange, value }) {
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div>
      {[1, 2, 3, 4].map((num) => (
        <label key={num}>
          <input
            checked={+num === +value}
            onChange={handleChange}
            type="radio"
            value={num}
            disabled={num > max}
          />{" "}
          {num}
        </label>
      ))}
    </div>
  );
}
