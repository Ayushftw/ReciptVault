import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';
import { useAppStore } from '../store/useAppStore';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, setCurrentUser } = useAppStore();

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase profile
      await updateProfile(userCredential.user, { displayName });

      // Create user document in Firestore
      const userData: User = {
        uid: userCredential.user.uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        plan: 'free',
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      setCurrentUser(userData);
    } catch (err: any) {
      const message = getAuthErrorMessage(err.code);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (err: any) {
      setError('Failed to sign out. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: currentUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  };
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return 'An error occurred. Please try again.';
  }
}
