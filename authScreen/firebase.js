import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzb145C3NTEo7eXaoGGeEf1WHtlKvIS8k",
  authDomain: "fairwaylanka-b35ba.firebaseapp.com",
  projectId: "fairwaylanka-b35ba",
  storageBucket: "fairwaylanka-b35ba.firebasestorage.app",
  messagingSenderId: "104764992253",
  appId: "1:104764992253:web:740a201beebdda01d12c94",
  measurementId: "G-KLV94HKYT4"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
