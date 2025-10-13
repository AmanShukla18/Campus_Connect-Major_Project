import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

type Group = { _id: string; name: string; subject?: string; members?: string[]; createdByEmail?: string; description?: string; meetingTime?: string };

export default function StudyGroupsScreen() {
  const { email } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  async function load() {
    try {
      const res = await api.get<Group[]>('/groups');
      setGroups(res.data);
    } catch (e) {
      console.warn('Failed to load groups', e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name) return;
    try {
      await api.post('/groups', { name, subject, description, meetingTime, createdByEmail: email });
      setName('');
      setSubject('');
      setDescription('');
      setMeetingTime('');
      setModalVisible(false);
      load();
    } catch (e) {
      alert('Failed to create group');
    }
  }

  async function join(id: string) {
    try {
      await api.post(`/groups/${id}/join`, { email });
      load();
    } catch (e) {
      alert('Failed to join group');
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
        keyExtractor={(g) => g._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={{ color: '#6b7280' }}>{item.subject} • {item.members?.length || 0} members</Text>
            {item.description && <Text style={{ color: '#4e5874' }}>{item.description}</Text>}
            {item.meetingTime && <Text style={{ color: '#4e5874' }}>Meeting: {item.meetingTime}</Text>}
            <TouchableOpacity style={styles.joinBtn} onPress={() => join(item._id)}>
              <Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16 }}>No groups yet.</Text>}
      />
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


