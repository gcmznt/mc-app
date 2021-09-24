import { useCallback, useState } from "react";
import { useData } from "../context/data";
import { useFirebase } from "../context/firebase";
import Box from "./ui/Box";
import Option from "./ui/Option";

export default function Options({
  onChange,
  onChangeOptions,
  options,
  selection,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data, fullSelect } = useData();

  const { logout, register, save, signIn, user } = useFirebase();

  console.log(user);

  const toggle = (key, el) => {
    onChange({
      ...selection,
      [key]: selection[key].includes(el)
        ? selection[key].filter((e) => e !== el)
        : [...selection[key], el],
    });
  };

  const selectAll = useCallback(
    (key, unselect) => () => {
      onChange({
        ...selection,
        [key]: unselect ? [] : fullSelect[key],
      });
    },
    [fullSelect, onChange, selection]
  );

  const SelectAll = useCallback(
    ({ items }) =>
      selection[items].length === fullSelect[items].length ? (
        <p onClick={selectAll(items, true)}>Unselect all</p>
      ) : (
        <p onClick={selectAll(items)}>Select all</p>
      ),
    [fullSelect, selectAll, selection]
  );

  const handlesubmit = (fn) => (e) => {
    e.preventDefault();
    fn();
  };

  const handleRegister = handlesubmit(() => register(email, password));
  const handleSignIn = handlesubmit(() => signIn(email, password));
  const handleLogout = handlesubmit(() => logout());
  const handleSave = handlesubmit(() => save({ test: "Funziona" }));

  return (
    <>
      <Box key="Sync" title="Sync" flag flat>
        {user ? (
          <>
            <form onSubmit={handleLogout}>
              <button type="submit">Logout</button>
            </form>
            <form onSubmit={handleSave}>
              <button type="submit">Salva</button>
            </form>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister}>
              Register:
              <input
                placeholder="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Register</button>
            </form>
            <form onSubmit={handleSignIn}>
              SignIn:
              <input
                placeholder="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">SignIn</button>
            </form>
          </>
        )}
      </Box>
      <Box key="Settings" title="Settings" flag flat>
        <p>Theme</p>
        <Option
          checked={options.mode === "auto"}
          label="System"
          type="radio"
          onChange={() => onChangeOptions("mode")("auto")}
          variant="inline"
        />
        <Option
          checked={options.mode === "dark"}
          label="Dark"
          type="radio"
          onChange={() => onChangeOptions("mode")("dark")}
          variant="inline"
        />
        <Option
          checked={options.mode === "light"}
          label="Light"
          type="radio"
          onChange={() => onChangeOptions("mode")("light")}
          variant="inline"
        />
        <p>Layout</p>
        <Option
          checked={options.timer}
          label="Show match timer"
          onChange={(e) => onChangeOptions("timer")(e.target.checked)}
        />
        <Option
          checked={options.compact}
          label="Use compact layout"
          onChange={(e) => onChangeOptions("compact")(e.target.checked)}
        />
      </Box>
      <Box key="Heroes" title="Heroes" flag flat>
        {data.heroes.map((opt) => (
          <Option
            key={opt.name}
            checked={selection.heroes.includes(opt.name)}
            flag={opt.pack !== opt.name && opt.pack}
            label={opt.name}
            onChange={(e) => toggle("heroes", e.target.value)}
            value={opt.name}
          />
        ))}
        <SelectAll items="heroes" />
      </Box>
      <Box key="Scenarios" title="Scenarios" flag flat>
        {data.scenarios.map((opt) => (
          <Option
            key={opt.name}
            checked={selection.scenarios.includes(opt.name)}
            flag={opt.pack !== opt.name && opt.pack}
            label={opt.name}
            onChange={(e) => toggle("scenarios", e.target.value)}
            value={opt.name}
          />
        ))}
        <SelectAll items="scenarios" />
      </Box>
      <Box key="Modular" title="Modular" flag flat>
        {Object.values(data.modularSets).map((opt) => (
          <Option
            key={opt.name}
            checked={selection.modularSets.includes(opt.name)}
            flag={opt.pack !== opt.name && opt.pack}
            label={opt.name}
            onChange={(e) => toggle("modularSets", e.target.value)}
            value={opt.name}
          />
        ))}
        <SelectAll items="modularSets" />
      </Box>
    </>
  );
}
