import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordScreen({ navigation }: any) {
  const { changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function doChangePassword() {
    if (!newPassword) {
      return Alert.alert('Missing', 'Please provide a new password');
    }
    try {
      await changePassword(newPassword);
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
        </Pressable>
      </View>
      <TouchableOpacity style={styles.btn} onPress={doChangePassword}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e9f2',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeIcon: {
    paddingHorizontal: 14,
  },
  btn: { backgroundColor: '#3b5bfd', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
