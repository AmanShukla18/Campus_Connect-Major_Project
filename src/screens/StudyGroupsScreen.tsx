import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../lib/firebase';

type Group = { id: string; name: string; subject?: string; members?: string[]; createdByEmail?: string; description?: string; meetingTime?: string };

export default function StudyGroupsScreen() {
  const { email } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  useEffect(() => {
    const qGroups = query(collection(firestore, 'groups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(qGroups, (snapshot) => {
      setGroups(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Group, 'id'>) })));
    });
    return unsubscribe;
  }, []);

  async function create() {
    if (!name) return;
    try {
      await addDoc(collection(firestore, 'groups'), {
        name,
        subject,
        description,
        meetingTime,
        createdByEmail: email,
        members: email ? [email] : [],
        createdAt: serverTimestamp(),
      });
      setName('');
      setSubject('');
      setDescription('');
      setMeetingTime('');
      setModalVisible(false);
    } catch (e) {
      alert('Failed to create group');
    }
  }

  async function join(id: string) {
    if (!email) return Alert.alert('Sign in required', 'You need to be logged in to join groups.');
    try {
      await updateDoc(doc(firestore, 'groups', id), { members: arrayUnion(email) });
    } catch (e) {
      alert('Failed to join group');
    }
  }

  async function leave(id: string) {
    if (!email) return;
    try {
      await updateDoc(doc(firestore, 'groups', id), { members: arrayRemove(email) });
      setDetailVisible(false);
    } catch (e) {
      alert('Failed to leave group');
    }
  }

  async function removeGroup(id: string) {
    try {
      await deleteDoc(doc(firestore, 'groups', id));
      setDetailVisible(false);
    } catch (e) {
      alert('Failed to delete group');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Groups</Text>
      <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Create Group</Text>
      </TouchableOpacity>
      {/* Modal for group creation */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>Create Study Group</Text>
            <TextInput placeholder="Group name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Subject" value={subject} onChangeText={setSubject} style={styles.input} />
            <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
            <TextInput placeholder="Meeting Time" value={meetingTime} onChangeText={setMeetingTime} style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#3b5bfd' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={create}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setActiveGroup(item); setDetailVisible(true); }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={{ color: '#6b7280' }}>{item.subject} • {item.members?.length || 0} members</Text>
              {item.description && <Text style={{ color: '#4e5874' }}>{item.description}</Text>}
              {item.meetingTime && <Text style={{ color: '#4e5874' }}>Meeting: {item.meetingTime}</Text>}
              <TouchableOpacity style={styles.joinBtn} onPress={() => join(item.id)}>
                <Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Join</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16 }}>No groups yet.</Text>}
      />
      {/* Detail modal */}
      {detailVisible && activeGroup && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: '700', fontSize: 18 }}>{activeGroup.name}</Text>
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>{activeGroup.subject}</Text>
            <Text style={{ marginBottom: 8 }}>{activeGroup.description}</Text>
            <Text style={{ color: '#6b7280', marginBottom: 12 }}>Members ({activeGroup.members?.length || 0})</Text>
            {activeGroup.members?.map((m) => (<Text key={m} style={{ paddingVertical: 4 }}>{m}</Text>))}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDetailVisible(false)}><Text style={{ color: '#3b5bfd' }}>Close</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => leave(activeGroup.id)}><Text style={{ color: '#3b5bfd' }}>Leave</Text></TouchableOpacity>
              {activeGroup.createdByEmail === email && (
                <TouchableOpacity style={styles.submitBtn} onPress={() => removeGroup(activeGroup.id)}><Text style={{ color: '#fff' }}>Delete</Text></TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  createBtn: { backgroundColor: '#3b5bfd', borderRadius: 12, paddingVertical: 12, alignItems: 'center', paddingHorizontal: 18, marginBottom: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e9f2' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e6e9f3' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  joinBtn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#eaf0ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%' },
  cancelBtn: { flex: 1, backgroundColor: '#eaf0ff', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  submitBtn: { flex: 1, backgroundColor: '#3b5bfd', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
});


