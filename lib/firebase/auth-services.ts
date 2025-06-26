import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth'
import { auth } from './client'

export interface AuthError {
  code: string
  message: string
}

// Google sign in
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider()
    return await signInWithPopup(auth, provider)
  } catch (error) {
    throw error
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Get auth error message
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.'
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups and try again.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    default:
      return 'An error occurred during sign-in. Please try again.'
  }
} 