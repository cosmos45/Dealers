import { initializeApp, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  initializeAuth,
  getReactNativePersistence,
  PhoneAuthProvider, 
  signInWithCredential,
  getAuth
} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdjiyTX4w_9GslQ95_KBXHyDqB0j5Ehis",
  authDomain: "dealers-3c994.firebaseapp.com",
  projectId: "dealers-3c994",
  storageBucket: "dealers-3c994.firebasestorage.app",
  messagingSenderId: "537486287011",
  appId: "1:537486287011:web:8352c99bdd80ae00985f16",
  measurementId: "G-20K4G72RP4"
};

let app;
let auth;
let db;
let analytics = null;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
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
  if (error.code !== 'app/duplicate-app') {
    console.error('Firebase initialization error:', error);
  }
  // If Firebase is already initialized, get existing instances
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// Phone auth utility functions
const sendVerificationCode = async (phoneNumber, recaptchaVerifier) => {
  try {
    const phoneProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    return verificationId;
  } catch (error) {
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
    throw error;
  }
};

// Check if user is logged in
const isUserLoggedIn = () => {
  return auth.currentUser !== null;
};

export { 
  auth, 
  db,
  sendVerificationCode, 
  verifyCode,
  PhoneAuthProvider,
  isUserLoggedIn
};
