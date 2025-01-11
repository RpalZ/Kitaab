// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXaBEBAy9my8JPy3c3DcydsWrsp2AirbI",
  authDomain: "kitaabauth.firebaseapp.com",
  projectId: "kitaabauth",
  storageBucket: "kitaabauth.firebasestorage.app",
  messagingSenderId: "560120008109",
  appId: "1:560120008109:web:874f8e2c7b62061897a524",
  measurementId: "G-WFMTH8VPYL"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
