# CampusConnect (Expo SDK 54)

Quick starter for the CampusConnect mobile app (Expo + TypeScript). This scaffold includes navigation, theming, a Firebase-safe stub, and a Lost & Found service with an in-memory fallback.

Getting started

1. Install dependencies

```powershell
cd "c:/Users/prana/OneDrive/Documents/CampusConnect"
npm install
```

2. Start Expo

```powershell
npm run start
# or
expo start -c
```

Notes

- Firebase is stubbed in `lib/firebase.ts` so the app runs without installing Firebase. After installing Firebase, follow `docs/firebase-backend.md` to wire it up.
- Reanimated requires the Babel plugin already configured in `babel.config.js`.

Project structure highlights

- `App.tsx` — App entry, ThemeProvider and Drawer navigation.
- `hooks/useAuth.tsx` — Simple auth + AsyncStorage persistence.
- `services/lostAndFound.ts` — Real-time (Firestore) or in-memory fallback API.

This is a scaffold to get you started. Extend the services and screens as your product requires.
