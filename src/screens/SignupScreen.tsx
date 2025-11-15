import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
let COLLEGE_IMG: any;
try { COLLEGE_IMG = require('../../assets/krmu pic.jpg'); } catch (e) { COLLEGE_IMG = undefined; }
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function doSignup() {
    if (!email || !password) return Alert.alert('Missing', 'Please provide email and password');
    (async () => {
      const ok = await signup(email, password);
      if (!ok) return Alert.alert('Exists', 'Account already exists or server error');
      Alert.alert('Created', 'Account created. Please login');
      navigation.navigate('Login');
    })();
  }

  return (
    <View style={styles.container}>
      {COLLEGE_IMG && <Image source={COLLEGE_IMG} style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />}
      <Text style={styles.title}>Sign up</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={doSignup}><Text style={{ color: '#fff', fontWeight: '700' }}>Create account</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f8ff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e9f2' },
  btn: { backgroundColor: '#3b5bfd', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
