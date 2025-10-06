// services/lostAndFound.ts
// In-memory fallback service for Lost & Found. This mirrors the Firestore-backed
// API (listenToFoundItems, addFoundItem, deleteFoundItem, fetchFoundItemsOnce)
// so the app can run without the 'firebase' package installed.

import type { FoundItem } from '../types/lostAndFound';
import { Alert } from 'react-native';
import { firebaseConfig, isFirebaseAvailable } from '../lib/firebase';

// In-memory store
let items: FoundItem[] = [
  {
    id: 'f1',
    title: "Black Wallet (Levi's)",
    description: 'Black leather wallet with student ID and some cash inside.',
    location: 'Library - 2nd Floor',
    contact: '080-xxx-xxxx',
    date: '2025-09-20',
    ownerEmail: 'demo@gmail.com'
  },
  {
    id: 'f2',
    title: 'Silver Keychain with 3 keys',
    description: 'Small silver keychain found near cafeteria.',
    location: 'Cafeteria',
    contact: 'example@student.edu',
    date: '2025-09-21',
    ownerEmail: 'someoneelse@example.com'
  }
];

// Simple pub/sub for real-time-like updates
const subscribers: Array<(list: FoundItem[]) => void> = [];
function notify() {
  subscribers.forEach(s => s([...items]));
}

export function listenToFoundItems(onUpdate: (items: FoundItem[]) => void) {
  // If Firebase is available, later we'll swap this implementation with a real Firestore listener.
  // For now we push the current items immediately and return an unsubscribe function.
  onUpdate([...items]);
  subscribers.push(onUpdate);
  return () => {
    const idx = subscribers.indexOf(onUpdate);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

export async function addFoundItem(item: Omit<FoundItem, 'id'>) {
  // If firebase were available we'd call the Firestore addDoc API here.
  // For the fallback we just create a local id and prepend to the items list.
  const id = `local-${Date.now()}`;
  const newItem: FoundItem = { id, ...item } as FoundItem;
  items = [newItem, ...items];
  notify();
  // Simulate networked id return
  return id;
}

export async function deleteFoundItem(id: string) {
  // In a real backend we'd delete the doc. Here we remove from the in-memory list.
  const prevLen = items.length;
  items = items.filter(i => i.id !== id);
  if (items.length !== prevLen) notify();
}

export async function fetchFoundItemsOnce(): Promise<FoundItem[]> {
  return [...items];
}

// Export a helper used by tests/dev tools to reset the in-memory store.
export function _resetInMemoryStore(newItems: FoundItem[]) {
  items = [...newItems];
  notify();
}

// Keep firebaseConfig export for debugging convenience
export { firebaseConfig };