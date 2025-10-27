import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXxBHaXYgOtEf1nUeZlxsPl4HgigAzMKk",
  authDomain: "campusconnect-33589.firebaseapp.com",
  projectId: "campusconnect-33589",
  storageBucket: "campusconnect-33589.firebasestorage.app",
  messagingSenderId: "602359382653",
  appId: "1:602359382653:web:b6dffe7d56e5b1b8b16714",
  measurementId: "G-7ZW39QZLE4"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});

const db = getFirestore(app);

export { auth, db };
