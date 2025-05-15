import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwW3wRrz5sVMwwn3mY85a6u4xo_Yb9S1c",
  authDomain: "emails-2752e.firebaseapp.com",
  projectId: "emails-2752e",
  storageBucket: "emails-2752e.appspot.com",
  messagingSenderId: "12546969283",
  appId: "1:12546969283:web:1183f7f2b100eab3809c76",
  measurementId: "G-4KNDCJB5L8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 