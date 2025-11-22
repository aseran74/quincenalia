import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzyhdNuoDcZN49QURXJfreMjWX-R97kjU",
  authDomain: "quincenalia-5eaa2.firebaseapp.com",
  projectId: "quincenalia-5eaa2",
  storageBucket: "quincenalia-5eaa2.firebasestorage.app",
  messagingSenderId: "754938560838",
  appId: "1:754938560838:web:f8912f3d195eb1b9aee547",
  measurementId: "G-NT6JBGS3EC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export Firebase auth functions
export { signInWithPopup, signOut, onAuthStateChanged };
