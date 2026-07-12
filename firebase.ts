import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "gen-lang-client-0387399641",
  appId: "1:856393266395:web:75cd44cedcd7626243c8fe",
  apiKey: "AIzaSyBA4irny8nG-K6pZf0Ppn9Uk5AbtKwlVoI",
  authDomain: "gen-lang-client-0387399641.firebaseapp.com",
  storageBucket: "gen-lang-client-0387399641.firebasestorage.app",
  messagingSenderId: "856393266395",
  measurementId: ""
};

const customDatabaseId = "ai-studio-auraaistudio-a9d0eb9e-5630-495e-a830-b5a8799af8ae";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, customDatabaseId);
export const storage = getStorage(app);

// Enable offline multi-tab persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn("Firestore offline persistence failed: multiple tabs open");
  } else if (err.code === "unimplemented") {
    // The current browser does not support all of the features required to enable persistence
    console.warn("Firestore offline persistence is not supported by this browser");
  } else {
    console.error("Firestore offline persistence error:", err);
  }
});

