# Firebase Backend — CampusConnect (Lost & Found)

This document describes the Firebase backend setup used by this project (Firestore). It contains the configuration, Firestore schema, available client-side service endpoints, recommended security rules, and next steps for auth and file storage.

> Note: This project currently uses the Firebase Web SDK (modular). The project includes lib/firebase.ts which initializes Firebase using the supplied credentials.

---

## 1) Firebase configuration (already applied)

The app uses this Firebase configuration (present in lib/firebase.ts):

```js
const firebaseConfig = {
  apiKey: "AIzaSyAuMeZtWd8UUaGS1br1wXFmqjuRilk777A",
  authDomain: "campusconnect-8e670.firebaseapp.com",
  projectId: "campusconnect-8e670",
  storageBucket: "campusconnect-8e670.firebasestorage.app",
  messagingSenderId: "924340486566",
  appId: "1:924340486566:web:5e50ff43c547781f004f67",
  measurementId: "G-5WFEFS8BSD"
};
```

lib/firebase.ts exports:
- db (Firestore instance)
- auth (Firebase Auth instance)
- firebaseConfigExport (for reference)

Important: Keep apiKey and other values secret-ish — these values are safe to embed in client apps for Firebase but do not expose admin credentials.

---

## 2) Firestore schema

Collection: `found_items`
Each document represents a single "found" report.

Document fields (recommended canonical shape):
- title: string (required)
- description: string (optional)
- location: string (optional)
- contact: string (optional)
- imageUri: string (optional) — URL (remote storage) or local URI
- date: string (YYYY-MM-DD) — the user-visible date when reported
- ownerEmail: string — (optional, current client uses email)
- ownerUid: string — (recommended: set to Firebase Auth uid) — used for secure deletes
- createdAt: Firestore Timestamp (serverTimestamp)

Why ownerUid? Security rules should rely on authenticated UIDs rather than emails because request.auth.uid is guaranteed by Firebase Auth and cannot be spoofed.

Indexing: We sort by createdAt (desc), so ensure an index exists on `createdAt` (single-field index handled automatically by Firestore). No composite indexes are required for the basic queries implemented here.

---

## 3) Service endpoints (client-side)

We expose a minimal service module at `services/lostAndFound.ts`. These are not "HTTP endpoints" but client helpers that talk to Firestore directly.

Public methods:

- listenToFoundItems(onUpdate: (items: FoundItem[]) => void) => () => void
  - Subscribes to a real-time snapshot of `found_items` ordered by `createdAt` desc.
  - Calls `onUpdate` with an array of items whenever data changes.
  - Returns an `unsubscribe` function to stop listening.

- addFoundItem(item: Omit<FoundItem, 'id'>) => Promise<string>
  - Adds a new found item to Firestore and returns the new document id.
  - Payload will be stored with `createdAt: serverTimestamp()`.
  - Recommended: include `ownerUid: auth.currentUser.uid` in addition to ownerEmail.

- deleteFoundItem(id: string) => Promise<void>
  - Deletes a document by id. Security rules (see below) must ensure only owners can delete.

- fetchFoundItemsOnce() => Promise<FoundItem[]>
  - Convenience helper to fetch a single snapshot (non-real-time) — useful for debugging or one-off reads.

Type: `FoundItem` (client-side)
- id: string
- title: string
- description?: string
- location?: string
- contact?: string
- imageUri?: string
- date: string (YYYY-MM-DD)
- ownerEmail: string

Files created/used:
- lib/firebase.ts (initialization)
- services/lostAndFound.ts (all service methods)
- types/lostAndFound.ts (type definitions)

---

## 4) Security rules (recommended)

When you enable Firebase Authentication (strongly recommended), use the following Firestore rules to ensure only the owner can delete/update their own found item documents. These rules assume documents store `ownerUid`.

Firestore rules snippet (deploy using Firebase CLI):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /found_items/{itemId} {
      allow read: if true; // public read

      // Create: only authenticated users can create items and must set ownerUid to their uid
      allow create: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;

      // Update/Delete: only owner can update/delete
      allow update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
    }
  }
}
```

Notes:
- The rule uses `resource.data.ownerUid` for update/delete authorization. If your client currently writes `ownerEmail` only, migrate to include `ownerUid` so rules can use them safely.
- If you cannot use Firebase Auth yet, be careful: allowing writes without auth means anyone with your config can write/delete data. For early development, you can keep rules relaxed, but lock them down before production.

---

## 5) Images / Storage

If you want to upload images for the found items (recommended for production), use Firebase Storage (bucket configured in your project). Flow:
- Upload image file to Storage at path `found_images/{docId}/{filename}`.
- Get a download URL (expiring vs. permanent) and save the public URL in the document (`imageUri`).
- Set Storage security rules to allow upload only for authenticated users and only into their own folder if required.

Example Storage rules snippet (basic):

```
service firebase.storage {
  match /b/{bucket}/o {
    match /found_images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // refine to owner-based naming if needed
    }
  }
}
```

Client-side note: Expo apps can upload with the Firebase JS SDK using `fetch` to get a blob and then `uploadBytes` from `firebase/storage`. You may also use a small server-side signed URL endpoint if you prefer.

---

## 6) Installation & setup

1. Install Firebase SDK in your project (from project root):

```
npm install firebase
# or
yarn add firebase
```

2. Already added `lib/firebase.ts` with the project config — ensure this file is used by services.

3. Add the service file `services/lostAndFound.ts` (already included). It uses Firestore modular API.

4. (Recommended) Enable Firebase Authentication (Email/Password) in the Firebase Console. Then update the client to sign-in using `auth.signInWithEmailAndPassword()` and set `ownerUid` to `auth.currentUser.uid` when creating items.

5. (Optional but recommended) Configure Storage for image uploads and update the client to upload images prior to creating a document. Save the download URL in `imageUri`.

6. Set Firestore rules (see section 4) and test them using the Firebase Emulator Suite or by deploying to a staging project.

---

## 7) Migration: ownerEmail -> ownerUid (recommended)

Right now the UI uses `ownerEmail` (because the project was using a local auth placeholder). For secure production deletes, follow these steps:

1. Enable Firebase Auth and make users sign in, retrieve `auth.currentUser.uid`.
2. Update `addFoundItem` calls to include `ownerUid: auth.currentUser.uid` (in services/lostAndFound.ts or in the screen logic), and keep ownerEmail for display if you want.
3. Deploy security rules that reference `ownerUid` (see section 4).
4. Optionally run a migration script (node script) that iterates existing documents and sets `ownerUid` when possible (if you can map emails to UIDs).

---

## 8) Files and endpoints changed/added (this commit)

- lib/firebase.ts — Firebase initialization with your credentials.
- types/lostAndFound.ts — TypeScript type for FoundItem.
- services/lostAndFound.ts — Firestore service (listenToFoundItems, addFoundItem, deleteFoundItem, fetchFoundItemsOnce).
- screens/LostAndFoundScreen.tsx — wired to real-time service and uses service methods for CRUD.

---

## 9) Can you use Firebase for real-time + other components?

Yes — Firebase (Firestore) is an excellent choice for real-time features, offline support, and working with other components like Auth and Storage. Advantages:
- Real-time listeners (onSnapshot) provide instant UI updates across devices.
- Firebase Auth integrates with Firestore rules for secure, per-user data access.
- Storage handles image uploads and CDN-ready download URLs.
- Scales well for the moderate load expected for campus apps.

Caveats:
- Security rules must be set properly (use ownerUid and require auth for write/delete).
- For larger scale or complex queries, monitor Firestore costs (reads/writes). Use batched writes and appropriate indexes.

---

## 10) Next recommended steps (I can implement these)

- Migrate from ownerEmail to ownerUid and update client/service to include ownerUid on create.
- Add Firebase Auth flows (sign-up, sign-in, sign-out) replacing the local useAuth hook.
- Add image upload flow using Firebase Storage and store download URLs in `imageUri`.
- Add an "Undo delete" snackbar for optimistic deletes.
- (Optional) Add Firebase Emulator support for local integration testing.

---

If you'd like, I can now:
- Implement Firebase Auth sign-in and migrate the app to use `auth.currentUser.uid` and `ownerUid` in documents.
- Add Storage upload flow for images and secure Storage rules.
- Add security rules files and deployment scripts (firebase.json + .firebaserc) and run the emulator locally.

Tell me which of the next steps you'd like me to implement first and I'll apply it.