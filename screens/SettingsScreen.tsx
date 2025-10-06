// screens/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
  Button,
  Linking,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import theme from '../lib/theme';

const MENU = [
  { id: 'm1', title: 'Notification Settings', icon: 'notifications-outline' },
  { id: 'm2', title: 'Account', icon: 'person-outline' },
  { id: 'm3', title: 'Privacy and Security', icon: 'lock-closed-outline' },
  { id: 'm4', title: 'Appearance', icon: 'eye-outline' },
  { id: 'm5', title: 'Language', icon: 'globe-outline' },
  { id: 'm6', title: 'Help', icon: 'help-circle-outline' },
  { id: 'm7', title: 'About', icon: 'download-outline' }
];

export default function SettingsScreen() {
  const { userEmail, signOut, profilePicUri, setProfilePic } = useAuth();
  const { mode, setMode, colors } = useTheme();

  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(false);
  const [allowSearch, setAllowSearch] = useState(true);

  // Account form (simple demo fields)
  const [displayName, setDisplayName] = useState('John Doe');
  const [phone, setPhone] = useState('');

  // Language
  const [language, setLanguage] = useState<'en' | 'es' | 'fr'>('en');

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') return;
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      // expo-image-picker v14+: result has { canceled: boolean, assets?: [{ uri }] }
      // handle both older and newer shapes
      // @ts-ignore
      const canceled = result.canceled ?? result.cancelled ?? false;
      // @ts-ignore
      const assets = result.assets ?? (result as any).selected ?? null;
      if (!canceled) {
        const uri = assets && assets.length ? assets[0].uri : (result as any).uri;
        if (uri) setProfilePic(uri);
      }
    } catch (e) {
      // noop
    }
  }

  function openModal(id: string) {
    setActiveModal(id);
  }

  function closeModal() {
    setActiveModal(null);
  }

  async function handleContactSupport() {
    const subject = encodeURIComponent('CampusConnect Support');
    const body = encodeURIComponent('Hi, I need help with...');
    const email = 'support@campusconnect.app';
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch (err) {
      // noop
    }
  }

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={pickImage} accessibilityRole="button">
            <Image source={{ uri: profilePicUri || 'https://i.pravatar.cc/40' }} style={styles.avatarSmall} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} accessibilityRole="button">
            <Image source={{ uri: profilePicUri || 'https://i.pravatar.cc/100' }} style={styles.avatar} />
          </TouchableOpacity>
          <View style={{ marginLeft: theme.spacing.md }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{userEmail ?? 'Not signed in'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {MENU.map(item => (
          <TouchableOpacity key={item.id} style={styles.row} onPress={() => openModal(item.id)}>
            <View style={styles.rowLeft}>
              <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              <Text style={styles.rowText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Notification Settings Modal */}
      <Modal visible={activeModal === 'm1'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Notification Settings</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
          </View>

          <View style={styles.modalActions}>
            <Button title="Close" onPress={closeModal} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Account Modal */}
      <Modal visible={activeModal === 'm2'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Account</Text>
          <Text style={{ marginBottom: 8, color: colors.onSurfaceVariant }}>Manage your account details</Text>

          <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Display name" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone (optional)" keyboardType="phone-pad" />

          <View style={styles.modalActionsRow}>
            <Button title="Save" onPress={() => { /* Save locally for now */ closeModal(); }} />
            <Button title="Sign Out" color="#d9534f" onPress={() => { signOut(); }} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={activeModal === 'm3'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Privacy & Security</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Profile Public</Text>
            <Switch value={profilePublic} onValueChange={setProfilePublic} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Allow search engines</Text>
            <Switch value={allowSearch} onValueChange={setAllowSearch} />
          </View>

          <View style={styles.modalActions}>
            <Button title="Close" onPress={closeModal} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Appearance Modal */}
      <Modal visible={activeModal === 'm4'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Appearance</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity style={[styles.optionButton, mode === 'system' && styles.optionActive]} onPress={() => setMode('system')}>
              <Text style={styles.optionText}>System Default</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, mode === 'light' && styles.optionActive]} onPress={() => setMode('light')}>
              <Text style={styles.optionText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, mode === 'dark' && styles.optionActive]} onPress={() => setMode('dark')}>
              <Text style={styles.optionText}>Dark</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <Button title="Close" onPress={closeModal} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Language Modal */}
      <Modal visible={activeModal === 'm5'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Language</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity style={[styles.optionButton, language === 'en' && styles.optionActive]} onPress={() => setLanguage('en')}>
              <Text style={styles.optionText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, language === 'es' && styles.optionActive]} onPress={() => setLanguage('es')}>
              <Text style={styles.optionText}>Español</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionButton, language === 'fr' && styles.optionActive]} onPress={() => setLanguage('fr')}>
              <Text style={styles.optionText}>Français</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <Button title="Close" onPress={closeModal} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Help Modal */}
      <Modal visible={activeModal === 'm6'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Help</Text>
          <Text style={{ color: colors.onSurfaceVariant, marginBottom: 12 }}>
            If you need help using CampusConnect, contact our support team or read the FAQ on the website.
          </Text>
          <Button title="Contact Support" onPress={handleContactSupport} />
          <View style={{ height: 12 }} />
          <Button title="Close" onPress={closeModal} />
        </SafeAreaView>
      </Modal>

      {/* About Modal */}
      <Modal visible={activeModal === 'm7'} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>About CampusConnect</Text>
          <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>Version: 1.0.0</Text>
          <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>
            CampusConnect helps students find notices, lost & found items, events, and study groups on campus.
          </Text>
          <View style={{ height: 12 }} />
          <Button title="Close" onPress={closeModal} />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: theme.spacing.md },
    header: { paddingVertical: theme.spacing.lg, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '700', color: colors.onSurface },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, position: 'absolute', right: 0, top: theme.spacing.lg },
    profileCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm },
    avatar: { width: 72, height: 72, borderRadius: 72 },
    name: { fontWeight: '700', fontSize: 16, color: colors.onSurface },
    email: { color: colors.onSurfaceVariant, marginTop: 4 },
    divider: { height: 1, backgroundColor: colors.outline, marginVertical: theme.spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm },
    rowLeft: { flexDirection: 'row', alignItems: 'center' },
    rowText: { marginLeft: theme.spacing.md, color: colors.onSurface },

    modalContainer: { flex: 1, backgroundColor: colors.surface, padding: theme.spacing.md },
    modalTitle: { fontSize: 20, fontWeight: '700', color: colors.onSurface, marginBottom: theme.spacing.md },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm },
    settingLabel: { color: colors.onSurface },
    input: { backgroundColor: '#fff', borderRadius: theme.radii.sm, padding: theme.spacing.sm, marginBottom: theme.spacing.sm },
    modalActions: { marginTop: theme.spacing.md },
    modalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    optionButton: { flex: 1, padding: theme.spacing.sm, marginHorizontal: 6, borderRadius: theme.radii.sm, backgroundColor: colors.surfaceVariant, alignItems: 'center' },
    optionActive: { borderColor: colors.primary, borderWidth: 1, backgroundColor: '#fff' },
    optionText: { color: colors.onSurface }
  });
}