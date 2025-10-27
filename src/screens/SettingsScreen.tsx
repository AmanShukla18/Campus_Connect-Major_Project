import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation() as any;
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.name}>{user?.email || 'Guest User'}</Text>
          <Text style={styles.sub}>Student • Member</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}><Text style={{ color: '#3b5bfd', fontWeight: '700' }}>Edit</Text></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}><Text style={styles.rowLabel}>Dark Mode</Text><Switch value={dark} onValueChange={setDark} /></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Notifications</Text><Switch value={notify} onValueChange={setNotify} /></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.row}><Text style={styles.rowLabel}>Manage Account</Text></TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePassword')}><Text style={styles.rowLabel}>Change Password</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => { signOut(); navigation.replace('Login'); }}>
        <Text style={{ color: '#ef4444', fontWeight: '800' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b1220' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: '#fff' },
  profileCard: { backgroundColor: '#071129', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#0f1b2f' },
  name: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sub: { color: '#9fb0d9' },
  editBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  section: { marginTop: 8, marginBottom: 12 },
  sectionTitle: { color: '#9fb0d9', marginBottom: 8, fontWeight: '700' },
  row: { backgroundColor: '#111a2e', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: '#dbe5ff', fontWeight: '600' },
  logout: { backgroundColor: '#111a2e', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
});
