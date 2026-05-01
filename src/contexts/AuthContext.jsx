import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const newUserData = {
      uid: user.uid,
      name,
      email,
      role, // 'leader' or 'member'
      teamId: null,
      createdAt: new Date()
    };
    
    await setDoc(userDocRef, newUserData);
    setUserData(newUserData);
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserData(null);
    return signOut(auth);
  }

  async function googleSignIn(role = 'member') {
    const result = await signInWithPopup(auth, googleProvider);
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      const newUserData = {
        uid: result.user.uid,
        name: result.user.displayName || 'Google User',
        email: result.user.email,
        role: role,
        teamId: null,
        createdAt: new Date()
      };
      await setDoc(userDocRef, newUserData);
    } else {
      // update state memory
      setUserData(userDocSnap.data());
    }
    return result;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch extra user data
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    logout,
    googleSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
