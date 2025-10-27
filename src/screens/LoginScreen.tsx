import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HERO_DEFAULT = require('../../assets/splash-icon.png');

import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const heroUrl = process.env.EXPO_PUBLIC_HERO_IMAGE_URL;

  async function onLogin() {
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Navigate to the main app screen after successful login
      navigation.replace('GetStarted');
    } catch (error: any) {
      Alert.alert('Failed to login: ' + error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login to CampusConnect</Text>
      <View style={styles.heroWrap}>
        {heroUrl ? (
          <Image source={{ uri: heroUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <Image source={HERO_DEFAULT} style={styles.hero} resizeMode="cover" />
        )}
      </View>
      <Text style={styles.welcome}>Welcome to CampusConnect</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
        </Pressable>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.signup}>
        Don't have an account? <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign Up</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6fd', paddingHorizontal: 24, paddingTop: 32 },
  header: { textAlign: 'center', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  heroWrap: { alignItems: 'center', marginBottom: 12 },
  hero: { width: '100%', height: 140, borderRadius: 18 },
  welcome: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderColor: '#e8ecf4',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 12,
    borderColor: '#e8ecf4',
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  link: { color: '#3b5bfd', fontWeight: '600' },
  loginBtn: { backgroundColor: '#3b5bfd', alignItems: 'center', paddingVertical: 16, borderRadius: 26, marginTop: 4 },
  signup: { textAlign: 'center', marginTop: 16, color: '#6b7280' },
});
