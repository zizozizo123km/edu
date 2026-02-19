
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAXhNaaab-qlON1aY9XLBcjaJfHR50u2uA",
  authDomain: "kids-d433f.firebaseapp.com",
  databaseURL: "https://kids-d433f-default-rtdb.firebaseio.com",
  projectId: "kids-d433f",
  storageBucket: "kids-d433f.firebasestorage.app",
  messagingSenderId: "1004459151815",
  appId: "1:1004459151815:web:2dce5f69ebc5c30222c9e2",
  measurementId: "G-SZZ9SWP475"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
