import { initializeApp, getApps, getApp } from "firebase/app";
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

const firebaseConfig = {
  apiKey: "AIzaSyACFR7jBK81KsQKMpR7AMNfA5SPBwpkWo0",
  authDomain: "dealers-f018b.firebaseapp.com",
  projectId: "dealers-f018b",
  storageBucket: "dealers-f018b.firebasestorage.app",
  messagingSenderId: "744120809079",
  appId: "1:744120809079:web:bf225d8e5e6d7e57357872",
  measurementId: "G-0VTDGFJSW5"
};

let app;
let auth;
let db;
let analytics = null;
let storage;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    db = getFirestore(app);
    storage = getStorage(app);
    
    if (typeof window !== 'undefined') {
      const initAnalytics = async () => {
        if (await isSupported()) {
          analytics = getAnalytics(app);
        }
      };
      initAnalytics();
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

const sendVerificationCode = async (phoneNumber) => {
  try {
    if (!auth) {
      throw new Error('Auth is not initialized');
    }
    
    const provider = new PhoneAuthProvider(auth);
    return new Promise((resolve, reject) => {
      provider.verifyPhoneNumber(
        phoneNumber,
        60,
        null,
      ).then(resolve).catch(reject);
    });
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

const getCurrentUser = () => {
  return auth.currentUser;
};

const signOut = async () => {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.updateProfile(updates);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

const sendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending email verification:", error);
    throw error;
  }
};

export {
  app,
  auth,
  db,
  storage,
  analytics,
  sendVerificationCode,
  verifyCode,
  isUserLoggedIn,
  getCurrentUser,
  signOut,
  updateUserProfile,
  sendEmailVerification,
  firebaseConfig
};
