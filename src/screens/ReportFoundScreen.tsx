import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ReportFoundScreen({ navigation }: any) {
  const { email } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  async function submit() {
    await api.post('/lostfound', { title, description, location, contact, imageUrl, reportedByEmail: email });
    navigation.goBack();
  }

  async function pickImage() {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Could not select image');
      return;
    }
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.uri) {
        setImageUploading(true);
        // Upload image to server (replace with your upload logic)
        try {
          const formData = new FormData();
          // react-native FormData file object -> cast to any to satisfy TS in this project
          (formData as any).append('file', { uri: asset.uri, type: asset.type, name: asset.fileName } as any);
          const uploadRes = await api.post('/upload', formData as any, { headers: { 'Content-Type': 'multipart/form-data' } });
          setImageUrl(uploadRes.data.url);
        } catch (e) {
          Alert.alert('Upload failed', 'Could not upload image.');
        }
        setImageUploading(false);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Found Item</Text>
      <TouchableOpacity style={styles.imageBox} onPress={pickImage} disabled={imageUploading}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: 100, height: 100, borderRadius: 10 }} />
        ) : (
          <Text style={{ color: '#8da2c0' }}>{imageUploading ? 'Uploading...' : 'Tap to add image'}</Text>
        )}
      </TouchableOpacity>
      <TextInput placeholder="Title (e.g. Black Wallet)" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} multiline />
      <TextInput placeholder="Location (where it was found)" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Contact (phone or email)" value={contact} onChangeText={setContact} style={styles.input} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#3b5bfd' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submit} onPress={submit}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  imageBox: { height: 120, borderRadius: 14, backgroundColor: '#eef3ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e9f2' },
  row: { flexDirection: 'row', gap: 12 },
  cancel: { flex: 1, backgroundColor: '#eaf0ff', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  submit: { flex: 1, backgroundColor: '#3b5bfd', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
});


