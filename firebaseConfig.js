import { initializeApp, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  initializeAuth,
  getReactNativePersistence,
  PhoneAuthProvider,
  signInWithCredential,
  getAuth,
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

// Initialize Firebase services
let app;
let auth;
let db;
let analytics = null;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Auth with React Native persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Analytics only if supported
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
  
  // If already initialized, use existing instances
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

// Check if the user is logged in
const isUserLoggedIn = () => {
  return auth.currentUser !== null;
};

// Initialize Firebase Storage
const storage = getStorage(app);

// Export initialized services and utility functions
export { auth, db, storage, sendVerificationCode, verifyCode, isUserLoggedIn };
