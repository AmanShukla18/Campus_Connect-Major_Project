import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

type Event = { id: string; title: string; date?: string; location?: string };

export default function EventsScreen() {
  const [items, setItems] = useState<Event[]>([]);

  useEffect(() => {
    const q = query(collection(firestore, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          const rawDate = data.date as any;
          const dateValue = typeof rawDate?.toDate === 'function' ? rawDate.toDate().toISOString() : rawDate;
          return {
            id: doc.id,
            title: data.title as string,
            date: dateValue,
            location: data.location as string | undefined,
          } as Event;
        })
      );
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={{ color: '#6b7280' }}>{[item.date, item.location].filter(Boolean).join(' • ')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No events yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e6e9f3' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});


