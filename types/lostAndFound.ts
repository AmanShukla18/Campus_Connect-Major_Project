// types/lostAndFound.ts

export type FoundItem = {
  id: string; // Firestore document id
  title: string;
  description?: string;
  location?: string;
  contact?: string;
  imageUri?: string; // local URI or remote storage URL
  date: string; // ISO date string (YYYY-MM-DD)
  ownerEmail?: string; // email (unique identifier for owner in the current auth model)
};