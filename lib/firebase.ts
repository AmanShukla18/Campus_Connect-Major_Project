// lib/firebase.ts
// This is a safe stub used while the 'firebase' package is not installed.
// It intentionally does NOT import the firebase SDK so Metro won't fail
// resolving 'firebase/app' when the dependency is missing.

import { Platform } from 'react-native';

// Your Firebase config (kept here so switching to the real SDK is trivial)
export const firebaseConfig = {
  apiKey: "AIzaSyAuMeZtWd8UUaGS1br1wXFmqjuRilk777A",
  authDomain: "campusconnect-8e670.firebaseapp.com",
  projectId: "campusconnect-8e670",
  storageBucket: "campusconnect-8e670.firebasestorage.app",
  messagingSenderId: "924340486566",
  appId: "1:924340486566:web:5e50ff43c547781f004f67",
  measurementId: "G-5WFEFS8BSD"
};

// When the real firebase package is available we will export real instances.
// For now we export null placeholders and a flag indicating firebase is not available.
export const db: null = null;
export const auth: null = null;
export const isFirebaseAvailable = false;

export function ensureFirebaseAvailable(): never {
  throw new Error(
    "Firebase is not available in this environment.\n" +
    "Install the 'firebase' package (npm install firebase) and restart the bundler,\n" +
    "or replace this file with an actual firebase initialization that imports the SDK."
  );
}

// Keep this file simple and easy to replace with the real implementation when you're ready.
// Example of the real code to add later is in the project PR notes / docs.