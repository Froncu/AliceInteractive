import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLeNx1MRsTzkalAsZhpTWkkOMPwoPO2mw",
  authDomain: "alicedownrabithole.firebaseapp.com",
  databaseURL: "https://alicedownrabithole-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alicedownrabithole",
  storageBucket: "alicedownrabithole.appspot.com",
  messagingSenderId: "161855541756",
  appId: "1:161855541756:web:7f4c1cc68d6f15b0ab2279",
  measurementId: "G-VSJY5XVPKM"
};

const firebaseApp = initializeApp(firebaseConfig);
export const aanalytics = getAnalytics(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);