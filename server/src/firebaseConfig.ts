
import * as admin from 'firebase-admin';

// IMPORTANT: Make sure you have the serviceAccountKey.json file in the server/ directory
// You can download this from your Firebase project settings -> Service accounts
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'campusconnect-33589', // Explicitly setting the project ID
});

export const db = admin.firestore();
