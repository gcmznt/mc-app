import { useState } from "react";
import { useFirebase } from "../context/firebase";
import "../styles/login-form.css";
import { load } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout, register, signIn, sync, user } = useFirebase();

  const handlesubmit = (fn) => (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    fn()
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };

  const handleRegister = handlesubmit(() => register(email, password));
  const handleSignIn = handlesubmit(() => signIn(email, password));
  const handleLogout = handlesubmit(logout);
  const handleSync = handlesubmit(sync);

  const lastSync = load(STORAGE_KEYS.LAST_SYNC);

  return (
    <div className={`login-form ${loading ? "is-loading" : ""}`}>
      {user ? (
        <>
          <h2>{user.email}</h2>
          <button onClick={handleSync}>Sync</button>
          <button onClick={handleLogout}>Logout</button>
          <p>
            {lastSync
              ? `Last sync: ${new Date(lastSync).toLocaleString()}`
              : "Never synced"}
          </p>
        </>
      ) : (
        <>
          <fieldset>
            <label className="login-form__label">
              Email
              <input
                placeholder="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="login-form__label">
              Password
              <input
                placeholder="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </fieldset>
          {error && <div className="login-form__error">{error}</div>}
          <div>
            <button onClick={handleRegister}>Register</button>
            <button onClick={handleSignIn}>SignIn</button>
          </div>
        </>
      )}
    </div>
  );
}
