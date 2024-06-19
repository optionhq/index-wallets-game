import { initializeApp } from "firebase/app";
import { getFirestore as parentGetFirestore } from "firebase/firestore";

export const getFirestore = () =>
  parentGetFirestore(
    initializeApp({
      apiKey: "AIzaSyBoP10XF55VHdYBaJqjvPWW5RmRLj3toE8",
      authDomain: "indexwallets.firebaseapp.com",
      projectId: "indexwallets",
      storageBucket: "indexwallets.appspot.com",
      messagingSenderId: "132549408004",
      appId: "1:132549408004:web:eec3dd02bbba580f0a4c51",
    }),
  );
