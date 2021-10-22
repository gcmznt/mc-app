import React from "react";
import ReactDOM from "react-dom";
import { v4 as uuid } from "uuid";

import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { FirebaseProvider } from "./context/firebase";
import { DataProvider } from "./context/data";
import { load, persist } from "./utils";
import { STORAGE_KEYS } from "./utils/constants";
import "./i18n";

const deviceId = load(STORAGE_KEYS.DEVICE);
if (!deviceId) persist(STORAGE_KEYS.DEVICE, uuid());

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
