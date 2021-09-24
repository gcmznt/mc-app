import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState();

  const app = initializeApp({
    apiKey: "AIzaSyC9NWj7eUejvekKggLpdP__It58sKwzjPk",
    authDomain: "first-player-marvel-champions.firebaseapp.com",
    projectId: "first-player-marvel-champions",
    storageBucket: "first-player-marvel-champions.appspot.com",
    messagingSenderId: "324641738063",
    appId: "1:324641738063:web:5a5aef4d5382788228893a",
    measurementId: "G-YWNFB2JD3R",
  });

  // const analytics = getAnalytics(app);
  const auth = getAuth();

  const register = useCallback(
    (email, password) => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential, userCredential.user);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [auth]
  );

  const signIn = useCallback(
    (email, password) => {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential, userCredential.user);
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [auth]
  );

  const logout = useCallback(() => {
    signOut(auth)
      .then(() => setUser(null))
      .catch(console.error);
  }, [auth]);

  const save = useCallback(
    async (data) => {
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "matches"), {
        uid: user.uid,
        ...data,
      });
      console.log("Document written", docRef);
    },
    [user]
  );

  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, [auth]);

  return (
    <FirebaseContext.Provider
      value={{ app, logout, register, save, signIn, user }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
