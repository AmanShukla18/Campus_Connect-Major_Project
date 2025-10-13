import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import api from '../api/client';
import { Platform } from 'react-native';

export default function UploadResourceScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  async function pickAndUpload() {
    // Web fallback: ask user to paste a direct URL and submit
    if (Platform.OS === 'web') {
      if (!urlInput) return Alert.alert('Missing URL', 'Paste a direct URL to the file (PDF, etc.)');
      setUploading(true);
      try {
        await api.post('/resources', { title, subject, year, url: urlInput });
        Alert.alert('Uploaded', 'Resource added successfully');
        navigation.goBack();
      } catch (e: any) {
        Alert.alert('Upload failed', e.message || 'Could not add resource');
      } finally {
        setUploading(false);
      }
      return;
    }

    // Native path: dynamically import the document picker to avoid loading native-only module on web
    try {
      const DocumentPicker = (await import('react-native-document-picker')).default;
      const res = await DocumentPicker.pickSingle({ type: DocumentPicker.types.allFiles });
      setUploading(true);
      const formData = new FormData();
      // react-native FormData file object -> cast to any to satisfy TS in this project
      (formData as any).append('file', { uri: res.uri, name: res.name, type: res.type } as any);
      const uploadRes = await api.post('/upload', formData as any, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.post('/resources', { title, subject, year, url: uploadRes.data.url });
      Alert.alert('Uploaded', 'Resource uploaded successfully');
      navigation.goBack();
    } catch (e: any) {
      // DocumentPicker throws a special error on cancel — check shape dynamically
      if (e && e.code === 'DOCUMENT_PICKER_CANCELED') return;
      Alert.alert('Error', e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Resource</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Subject" value={subject} onChangeText={setSubject} style={styles.input} />
      <TextInput placeholder="Year" value={year} onChangeText={setYear} style={styles.input} />
      {Platform.OS === 'web' ? (
        <>
          <TextInput placeholder="Direct URL to file (PDF)" value={urlInput} onChangeText={setUrlInput} style={styles.input} />
          <TouchableOpacity style={styles.uploadBtn} onPress={pickAndUpload} disabled={uploading}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{uploading ? 'Uploading...' : 'Add Resource from URL'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.uploadBtn} onPress={pickAndUpload} disabled={uploading}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{uploading ? 'Uploading...' : 'Pick & Upload Document'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e9f2' },
  uploadBtn: { backgroundColor: '#3b5bfd', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
