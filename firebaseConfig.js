import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  initializeAuth,
  getReactNativePersistence,
  PhoneAuthProvider,
  signInWithCredential,
  getAuth,
  sendEmailVerification as firebaseSendEmailVerification,
  GoogleAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

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

const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '744120809079-js49q528de9cdb573njbsfdfep2f9ak9.apps.googleusercontent.com',
    webClientId: '744120809079-3fg0h0qt64gjehfein9sfqni29675vij.apps.googleusercontent.com',
    responseType: "id_token",
    scopes: ['profile', 'email']
  });
  return { request, response, promptAsync };
};





const signInWithGoogle = async (promptAsync) => {
  try {
    const response = await promptAsync();
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      return signInWithCredential(auth, credential);
    }
  } catch (error) {
    throw error;
  }
};

const sendVerificationCode = async (phoneNumber) => {
  try {
    if (!auth) {
      throw new Error('Auth is not initialized');
    }
    const provider = new PhoneAuthProvider(auth);
    return new Promise((resolve, reject) => {
      provider.verifyPhoneNumber(phoneNumber, 60, null)
        .then(resolve)
        .catch(reject);
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

const verifyCode = async (verificationId, verificationCode) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
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

const sendEmailVerification = async (user) => {
  try {
    await firebaseSendEmailVerification(user);
    return true;
  } catch (error) {
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
  firebaseConfig,
  signInWithGoogle,
  useGoogleSignIn,
  sendEmailVerification
};
