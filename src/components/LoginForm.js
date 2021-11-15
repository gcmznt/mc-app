import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useFirebase } from "../context/firebase";
import "../styles/login-form.css";
import { load } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";

export default function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(false);
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

  useEffect(() => {
    load(STORAGE_KEYS.LAST_SYNC).then(setLastSync);
  }, []);

  const lock = user === undefined || loading;

  return (
    <div className={`login-form ${lock ? "is-loading" : ""}`}>
      {user === undefined ? null : user ? (
        <>
          <h2>{user.email}</h2>
          <button onClick={handleSync}>{t("Sync")}</button>
          <button onClick={handleLogout}>{t("Logout")}</button>
          <p>
            <small>
              {lastSync
                ? `${t("Last sync")}: ${new Date(lastSync).toLocaleString()}`
                : t("Never synced")}
            </small>
          </p>
        </>
      ) : (
        <>
          <fieldset>
            <label className="login-form__label">
              {t("Email")}
              <input
                placeholder="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="login-form__label">
              {t("Password")}
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
            <button onClick={handleRegister}>{t("Register")}</button>
            <button onClick={handleSignIn}>{t("SignIn")}</button>
          </div>
        </>
      )}
    </div>
  );
}
