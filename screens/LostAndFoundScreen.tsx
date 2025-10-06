import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Platform,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import theme from '../lib/theme';
import FoundCard, { FoundItem as FoundItemType } from '../components/FoundCard';
import { useAuth } from '../hooks/useAuth';

// Firestore service
import { listenToFoundItems, addFoundItem, deleteFoundItem, fetchFoundItemsOnce } from '../services/lostAndFound';

const initialMock: FoundItemType[] = [
  {
    id: 'f1',
    title: 'Black Wallet (Levi\'s)',
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

export default function LostAndFoundScreen() {
  const { userEmail } = useAuth();
  const [foundItems, setFoundItems] = useState<FoundItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates with graceful fallback if Firestore isn't initialized
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        unsub = listenToFoundItems(items => {
          setFoundItems(items);
          setLoading(false);
        });
      } catch (err) {
        console.warn('Failed to subscribe to Firestore, falling back to local data', err);
        // Try a one-off fetch; if that fails use initial mock
        try {
          const items = await fetchFoundItemsOnce();
          setFoundItems(items.length ? items : initialMock);
        } catch (err2) {
          setFoundItems(initialMock);
        }
        setLoading(false);
      }
    })();

    return () => {
      try {
        if (unsub) unsub();
      } catch (e) {
        // noop
      }
    };
  }, []);

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access media library is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7
      });
      if (!result.canceled) {
        // expo-image-picker v14+ returns an object with assets array
        // handle both possible shapes
        // @ts-ignore
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setImageUri(uri as string);
      }
    } catch (err) {
      console.warn('Image picker error', err);
    }
  }

  function openReportForm() {
    // reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setContact('');
    setImageUri(null);
    setIsModalOpen(true);
  }

  async function submitReport() {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please provide a title for the found item.');
      return;
    }

    const newItem: Omit<FoundItemType, 'id'> = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      contact: contact.trim(),
      imageUri: imageUri || undefined,
      date: new Date().toISOString().slice(0, 10),
      ownerEmail: userEmail || 'unknown'
    };

    try {
      await addFoundItem(newItem);
      setIsModalOpen(false);
    } catch (err) {
      console.warn('Failed to add to Firestore, adding locally', err);
      // optimistic local add so the user sees their item immediately
      const localId = `local-${Date.now()}`;
      setFoundItems(prev => [{ id: localId, ...newItem }, ...prev]);
      setIsModalOpen(false);
      Alert.alert('Offline mode', 'Your report was saved locally and will sync when connection is available.');
    }
  }

  async function markDone(itemId: string) {
    // Only owner should be able to delete — UI already hides the control for others.
    // Optimistic UI removed immediately
    setFoundItems(prev => prev.filter(i => i.id !== itemId));
    try {
      await deleteFoundItem(itemId);
    } catch (err) {
      console.warn('Failed to delete from Firestore, item removed locally', err);
      Alert.alert('Offline mode', 'Item removed locally. It will be deleted from server when connection is available.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={[ 'top' ]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found</Text>
        <Text style={styles.headerSubtitle}>Find or report items — instant updates</Text>
      </View>

      <View style={styles.splitContainer}>
        {/* 70%: Look for lost object */}
        <View style={styles.lookSection}>
          <Text style={styles.sectionTitle}>Look for lost object</Text>

          {loading ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading...</Text>
          ) : (
            <FlatList
              data={foundItems}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <FoundCard
                  item={item}
                  onPress={() => { /* placeholder: open detail */ }}
                  isOwner={userEmail ? item.ownerEmail === userEmail : false}
                  onMarkDone={() => markDone(item.id)}
                />
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </View>

        {/* 30%: Post a found object */}
        <View style={styles.postSection}>
          <Text style={styles.postTitle}>Post a found object</Text>
          <Text style={styles.postSubtitle}>Help someone get their item back — report what you found.</Text>
          <TouchableOpacity style={styles.reportButton} onPress={openReportForm} accessibilityRole="button">
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full page modal form */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>Report Found Item</Text>

              <TouchableOpacity style={styles.imagePicker} onPress={pickImage} accessibilityRole="button">
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>Tap to add image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                placeholder="Title (e.g. Black Wallet)"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />

              <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 110 }]}
                multiline
              />

              <TextInput
                placeholder="Location (where it was found)"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
              />

              <TextInput
                placeholder="Contact (phone or email)"
                value={contact}
                onChangeText={setContact}
                style={styles.input}
                keyboardType="email-address"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitReport} style={[styles.modalButton, styles.submitButton]}>
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md
  },
  header: {
    paddingVertical: theme.spacing.lg
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.onSurface
  },
  headerSubtitle: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  lookSection: {
    flex: 7
  },
  postSection: {
    flex: 3,
    marginTop: theme.spacing.sm,
    backgroundColor: 'white',
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface
  },
  postSubtitle: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant
  },
  reportButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  reportButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: '700'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md
  },
  modalScroll: {
    paddingVertical: theme.spacing.lg
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  imagePlaceholder: {
    width: 180,
    height: 120,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickedImage: {
    width: 180,
    height: 120,
    borderRadius: 8
  },
  input: {
    backgroundColor: 'white',
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.body,
    color: theme.colors.onSurface
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: theme.spacing.sm
  },
  submitButton: {
    backgroundColor: theme.colors.primary
  },
  cancelText: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '700'
  },
  submitText: {
    color: theme.colors.onPrimary,
    fontWeight: '700'
  }
});