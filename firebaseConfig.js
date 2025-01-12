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
  apiKey: "AIzaSyCdjiyTX4w_9GslQ95_KBXHyDqB0j5Ehis",
  authDomain: "dealers-3c994.firebaseapp.com",
  projectId: "dealers-3c994",
  storageBucket: "dealers-3c994.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "537486287011",
  appId: "1:537486287011:web:8352c99bdd80ae00985f16",
  measurementId: "G-20K4G72RP4",
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
