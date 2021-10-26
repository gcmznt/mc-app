import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";

import { useData } from "./data";
import { load as loadUtil, persist } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState();
  const { clear, clearStats, matches, saveStats } = useData();

  initializeApp({
    apiKey: "AIzaSyC9NWj7eUejvekKggLpdP__It58sKwzjPk",
    authDomain: "first-player-marvel-champions.firebaseapp.com",
    projectId: "first-player-marvel-champions",
    storageBucket: "first-player-marvel-champions.appspot.com",
    messagingSenderId: "324641738063",
    appId: "1:324641738063:web:5a5aef4d5382788228893a",
    measurementId: "G-YWNFB2JD3R",
  });

  const auth = getAuth();

  const register = useCallback(
    (email, password) => createUserWithEmailAndPassword(auth, email, password),
    [auth]
  );

  const signIn = useCallback(
    (email, password) => signInWithEmailAndPassword(auth, email, password),
    [auth]
  );

  const logout = useCallback(() => {
    return signOut(auth)
      .then(() => setUser(null))
      .catch(console.error);
  }, [auth]);

  const save = useCallback(
    (id, data) => {
      const db = getFirestore();
      return setDoc(
        doc(db, "users", user.uid, "matches", id),
        JSON.parse(JSON.stringify(data)) // Filter undefined values
      );
    },
    [user]
  );

  const remove = useCallback(() => {
    const db = getFirestore();
    return Promise.all(
      (loadUtil(STORAGE_KEYS.TO_DELETE) || []).map((id) => {
        return deleteDoc(doc(db, "users", user.uid, "matches", id));
      })
    );
  }, [user]);

  const load = useCallback(() => {
    const db = getFirestore();
    return getDocs(collection(db, "users", user.uid, "matches"));
  }, [user]);

  const upload = useCallback(() => {
    return Promise.all(matches.map((match) => save(match.matchId, match)));
  }, [matches, save]);

  const download = useCallback(() => {
    return load().then((qs) =>
      qs.forEach((doc) => {
        const matchData = doc.data();
        saveStats(matchData);
      })
    );
  }, [load, saveStats]);

  const sync = useCallback(() => {
    clearStats();
    return upload()
      .then(() => remove())
      .then(() => download())
      .then(() => persist(STORAGE_KEYS.LAST_SYNC, new Date()))
      .then(() => clear());
  }, [clear, clearStats, download, remove, upload]);

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, [auth]);

  return (
    <FirebaseContext.Provider
      value={{ logout, register, remove, signIn, sync, user }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
