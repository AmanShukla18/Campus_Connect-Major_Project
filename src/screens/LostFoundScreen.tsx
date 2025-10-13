import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

type Item = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  contact?: string;
  status?: string;
  date?: string;
};

export default function LostFoundScreen({ navigation }: any) {
  const { email } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Claimed'>('All');

  async function load() {
    const res = await api.get<Item[]>('/lostfound');
    setItems(res.data);
  }

  async function claim(id: string) {
    await api.patch(`/lostfound/${id}/claim`);
    load();
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000); // simple polling for realtime-ish updates
    return () => clearInterval(t);
  }, []);

  async function remove(id: string) {
    await api.delete(`/lostfound/${id}`, { params: { reporter: email || '' } });
    load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lost & Found</Text>
      <Text style={{ color: '#6b7280', marginBottom: 12 }}>Find or report items — instant updates</Text>
      <Text style={styles.section}>Look for lost object</Text>
      <View style={styles.filters}>
        {(['All','Active','Claimed'] as const).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter===f && styles.chipActive]}>
            <Text style={[styles.chipText, filter===f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={items.filter(i => filter==='All' ? true : i.status===filter)}
        keyExtractor={(n) => n._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.description && <Text style={styles.cardBody}>{item.description}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#6b7280' }}>Location: {item.location}</Text>
                <Text style={{ color: '#6b7280' }}>Contact: {item.contact}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                {item.status !== 'Claimed' && (
                  <TouchableOpacity onPress={() => claim(item._id)}>
                    <Text style={{ color: '#3b5bfd', fontWeight: '600' }}>Mark Claimed</Text>
                  </TouchableOpacity>
                )}
                {email && item.reportedByEmail === email && (
                  <TouchableOpacity onPress={() => remove(item._id)}>
                    <Text style={{ color: '#ef4444', fontWeight: '700' }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items yet.</Text>}
      />
      <View style={styles.reportCard}>
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Post a found object</Text>
        <Text style={{ color: '#6b7280', marginBottom: 12 }}>Help someone get their item back — report what you found.</Text>
        <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('ReportFound')}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  section: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e9f3',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardBody: { color: '#4e5874' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#eaf0ff' },
  chipActive: { backgroundColor: '#3b5bfd' },
  chipText: { color: '#3b5bfd', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  reportCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 6, borderWidth: 1, borderColor: '#e6e9f3' },
  reportBtn: { backgroundColor: '#3b5bfd', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});


