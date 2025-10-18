// config/firebaseConfig.jsx
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuSml2PCeS49V5cvFwJUn7T0dEXt7-EKM",
  authDomain: "learners-hub-2025.firebaseapp.com",
  projectId: "learners-hub-2025",
  storageBucket: "learners-hub-2025.firebasestorage.app",
  messagingSenderId: "1085838085386",
  appId: "1:1085838085386:web:3c44aede04f1f798cefef3",
  measurementId: "G-94EMEZM9G5"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);