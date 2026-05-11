import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Replace these with your environment variables or actual keys later
const firebaseConfig = {
  apiKey: "AIzaSyCqW0_Gy0Cd2iPf8yAI3po5qrHE7OwWZFI",
  authDomain: "ecotank-e4b07.firebaseapp.com",
  projectId: "ecotank-e4b07",
  storageBucket: "ecotank-e4b07.firebasestorage.app",
  messagingSenderId: "626382445553",
  appId: "1:626382445553:web:b3ce83afd79ab435290250"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
