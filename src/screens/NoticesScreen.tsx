import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../lib/firebase';

type Notice = {
  id: string;
  title: string;
  department?: string;
  year?: string;
  type?: string;
  content?: string;
  createdAt?: Date;
};

export default function NoticesScreen() {
  const { email } = useAuth();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Notice[]>([]);
  const [modal, setModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    const q = query(collection(firestore, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title as string,
            department: data.department,
            year: data.year,
            type: data.type,
            content: data.content,
            createdAt: data.createdAt?.toDate?.() ?? undefined,
          } as Notice;
        })
      );
    });
    return unsubscribe;
  }, []);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const needle = search.toLowerCase();
    return items.filter((notice) =>
      [notice.title, notice.content, notice.department, notice.type]
        .filter(Boolean)
        .some((field) => (field || '').toLowerCase().includes(needle))
    );
  }, [items, search]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notices</Text>
      <TextInput
        placeholder="Search notices, keywords, department..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.content && <Text style={styles.cardBody}>{item.content}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notices yet.</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
      </TouchableOpacity>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.cardTitle}>Create Notice</Text>
            <TextInput placeholder="Title" value={newTitle} onChangeText={setNewTitle} style={styles.input} />
            <TextInput placeholder="Description" value={newContent} onChangeText={setNewContent} style={[styles.input, { height: 100 }]} multiline />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.fab, { position: 'relative', backgroundColor: '#eaf0ff' }]} onPress={() => setModal(false)}>
                <Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fab, { position: 'relative' }]}
                onPress={async () => {
                  if (!newTitle) return;
                  await addDoc(collection(firestore, 'notices'), {
                    title: newTitle,
                    content: newContent,
                    department: 'All',
                    type: 'General',
                    year: 'All',
                    createdAt: serverTimestamp(),
                    createdBy: email,
                  });
                  setModal(false);
                  setNewTitle('');
                  setNewContent('');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e9f2',
  },
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#3b5bfd',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 22,
    elevation: 3,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
});


