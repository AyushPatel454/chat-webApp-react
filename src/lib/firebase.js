import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchatweb.firebaseapp.com",
  projectId: "reactchatweb",
  storageBucket: "reactchatweb.appspot.com",
  messagingSenderId: "909916238430",
  appId: "1:909916238430:web:9d375d177b37ddf2d93acf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(); // for authentication
export const db = getFirestore(); // for database
export const storage = getStorage(); // for storing image