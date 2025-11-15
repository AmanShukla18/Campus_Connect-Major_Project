import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Switch } from 'react-native';

const HERO_DEFAULT = require('../../assets/splash-icon.png');
// College image (saved as 'krmu pic.jpg' in assets)
let COLLEGE_IMG: any;
try { COLLEGE_IMG = require('../../assets/krmu pic.jpg'); } catch (e) { COLLEGE_IMG = HERO_DEFAULT; }

import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { signIn, signInWithCredentials } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const heroUrl = process.env.EXPO_PUBLIC_HERO_IMAGE_URL;

  function onLogin() {
    const e = email.trim().toLowerCase();
    if (e === 'demo@gmail.com' && password === 'demo123') {
      signIn('demo@gmail.com');
      navigation.replace('GetStarted');
      return;
    }
    (async () => {
      const ok = await signInWithCredentials(e, password);
      if (ok) navigation.replace('GetStarted');
      else alert('Invalid credentials. Try demo@gmail.com / demo123 or create an account');
    })();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login to CampusConnect</Text>
      <View style={styles.heroWrap}>
        <Image source={COLLEGE_IMG} style={styles.hero} resizeMode="cover" />
      </View>
      <Text style={styles.welcome}>Welcome to CampusConnect</Text>
      <TextInput
        placeholder="Email or Student ID"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.row}>
        <Text style={styles.muted}>Remember me</Text>
        <Switch value={remember} onValueChange={setRemember} />
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Login</Text>
      </TouchableOpacity>
  <Text style={styles.signup}>Don't have an account? <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign Up</Text></Text>
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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  muted: { color: '#6b7280', marginRight: 8 },
  link: { color: '#3b5bfd', fontWeight: '600' },
  loginBtn: { backgroundColor: '#3b5bfd', alignItems: 'center', paddingVertical: 16, borderRadius: 26, marginTop: 4 },
  signup: { textAlign: 'center', marginTop: 16, color: '#6b7280' },
});


