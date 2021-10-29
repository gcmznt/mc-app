import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { FirebaseProvider } from "./context/firebase";
import { DataProvider } from "./context/data";
import "./i18n";
import { STORAGE_KEYS } from "./utils/constants";
import { persist } from "./utils";

function load(key) {
  return JSON.parse(localStorage.getItem(key)) || false;
}

function move(key, val) {
  persist(key, val);
  localStorage.removeItem(key);
}

[
  STORAGE_KEYS.MATCHES,
  STORAGE_KEYS.SETTINGS,
  STORAGE_KEYS.OPTIONS,
  STORAGE_KEYS.CURRENT,
  STORAGE_KEYS.SELECTION,
].forEach((key) => {
  const saved = load(key);
  if (saved) move(key, saved);
});

ReactDOM.render(
  <React.StrictMode>
    <DataProvider>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </DataProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
serviceWorkerRegistration.register();
reportWebVitals();
