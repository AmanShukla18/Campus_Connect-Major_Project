import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Linking } from 'react-native';
import api from '../api/client';
import { useNavigation } from '@react-navigation/native';

type Resource = {
  _id: string;
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

  async function load() {
    const res = await api.get<Resource[]>('/resources', { params: { q } });
    setItems(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resources</Text>
      <TextInput placeholder="Search by title, subject, year..." value={q} onChangeText={setQ} onSubmitEditing={load} style={styles.input} />
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
          await api.post('/resources', { title: quickUrl.split('/').pop() || 'Resource', url: quickUrl });
          setQuickUrl('');
          load();
        } catch (e) {
          alert('Failed to add URL');
        } finally { setAdding(false); }
      }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>{adding ? 'Adding...' : 'Add URL'}</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        keyExtractor={(n) => n._id}
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


