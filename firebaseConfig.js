// firebaseConfig.js

import { initializeApp, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  initializeAuth,
  getReactNativePersistence,
  PhoneAuthProvider,
  signInWithCredential,
  getAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACFR7jBK81KsQKMpR7AMNfA5SPBwpkWo0",
  authDomain: "dealers-f018b.firebaseapp.com",
  projectId: "dealers-f018b",
  storageBucket: "dealers-f018b.firebasestorage.app",
  messagingSenderId: "744120809079",
  appId: "1:744120809079:web:bf225d8e5e6d7e57357872",
  measurementId: "G-0VTDGFJSW5"
};
// Export firebaseConfig as default
export default firebaseConfig;

// Initialize Firebase
let app;
let auth;
let db;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = getFirestore(app);
  const initAnalytics = async () => {
    if (await isSupported()) {
      analytics = getAnalytics(app);
    }
  };
  initAnalytics();
} catch (error) {
  if (error.code !== "app/duplicate-app") {
    console.error("Firebase initialization error:", error);
  }
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// Utility functions for phone authentication
const sendVerificationCode = async (phoneNumber, recaptchaVerifier) => {
  try {
    const phoneProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    return verificationId;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

const verifyCode = async (verificationId, verificationCode) => {
  try {
    const credential = PhoneAuthProvider.credential(
      verificationId,
      verificationCode
    );
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};

const isUserLoggedIn = () => {
  return auth.currentUser !== null;
};

const storage = getStorage(app);

export {
  app,
  auth,
  db,
  storage,
  sendVerificationCode,
  verifyCode,
  isUserLoggedIn
};
