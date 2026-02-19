
import { initializeApp } from "https://esm.sh/firebase@10.8.0/app";
import { getAuth } from "https://esm.sh/firebase@10.8.0/auth";
import { getDatabase } from "https://esm.sh/firebase@10.8.0/database";

const firebaseConfig = {
  apiKey: "AIzaSyAXhNaaab-qlON1aY9XLBcjaJfHR50u2uA",
  authDomain: "kids-d433f.firebaseapp.com",
  databaseURL: "https://kids-d433f-default-rtdb.firebaseio.com",
  projectId: "kids-d433f",
  storageBucket: "kids-d433f.firebasestorage.app",
  messagingSenderId: "1004459151815",
  appId: "1:1004459151815:web:2dce5f69ebc5c30222c9e2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
