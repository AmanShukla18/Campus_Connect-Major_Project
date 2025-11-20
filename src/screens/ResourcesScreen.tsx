import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

type Resource = {
  id: string;
  title: string;
  subject?: string;
  year?: string;
  url?: string;
};

export default function ResourcesScreen() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Resource[]>([]);
  const navigation = useNavigation() as any;
  const [quickUrl, setQuickUrl] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const qResources = query(collection(firestore, 'resources'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qResources, (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Resource, 'id'>) })));
    });
    return unsubscribe;
  }, []);

  const filteredResources = useMemo(() => {
    if (!q) return items;
    const needle = q.toLowerCase();
    return items.filter((item) =>
      [item.title, item.subject, item.year]
        .filter(Boolean)
        .some((field) => (field || '').toLowerCase().includes(needle))
    );
  }, [items, q]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resources</Text>
      <TextInput placeholder="Search by title, subject, year..." value={q} onChangeText={setQ} style={styles.input} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.upload} onPress={() => navigation.navigate('UploadResource' as any)}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Upload</Text>
        </TouchableOpacity>
      </View>
      {/* Quick add URL (web-friendly) */}
      <TextInput placeholder="Paste direct PDF URL here" value={quickUrl} onChangeText={setQuickUrl} style={styles.input} />
      <TouchableOpacity style={[styles.upload, { marginBottom: 12 }]} onPress={async () => {
        if (!quickUrl) return;
        setAdding(true);
        try {
          await addDoc(collection(firestore, 'resources'), {
            title: quickUrl.split('/').pop() || 'Resource',
            url: quickUrl,
            createdAt: serverTimestamp(),
          });
          setQuickUrl('');
        } catch (e) {
          alert('Failed to add URL');
        } finally { setAdding(false); }
      }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>{adding ? 'Adding...' : 'Add URL'}</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredResources}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={{ color: '#6b7280' }}>{[item.subject, item.year].filter(Boolean).join(' • ')}</Text>
            {item.url && (
              <TouchableOpacity onPress={() => Linking.openURL(item.url!)} style={styles.previewBtn}>
                <Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Preview</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No resources yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e9f2' },
  row: { gap: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e6e9f3' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
  upload: { backgroundColor: '#3b5bfd', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  previewBtn: { marginTop: 8, backgroundColor: '#eaf0ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
});


