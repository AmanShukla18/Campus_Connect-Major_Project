// New file: screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Switch, Dimensions } from 'react-native';
import theme from '../lib/theme';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const res = await signIn(email, password);
    if (!res.success) setError(res.message || 'Login failed');
  };

  const heroSource = { uri: 'https://www.dialeducation.com/assets/images/college/banner_1672818624.jpg' };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.header}>Login to CampusConnect</Text>
        <Image source={heroSource} style={styles.hero} resizeMode="cover" />

        <Text style={styles.title}>Welcome to CampusConnect</Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email or Student ID"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.remember}>Remember me</Text>
              <Switch value={remember} onValueChange={setRemember} thumbColor={remember ? theme.colors.primary : '#fff'} />
            </View>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.loginBtn} onPress={onSubmit} accessibilityRole="button">
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.caption}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  inner: { flex: 1, paddingTop: theme.spacing.xl + 8, paddingHorizontal: theme.spacing.lg, justifyContent: 'flex-start' },
  header: { textAlign: 'center', fontSize: 18, marginBottom: theme.spacing.sm, color: theme.colors.onSurface },
  hero: { width: width - theme.spacing.lg * 2, height: 140, borderRadius: theme.radii.lg, backgroundColor: '#eee', alignSelf: 'center', marginBottom: theme.spacing.md },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: theme.spacing.md, color: theme.colors.onSurface },
  form: { marginTop: 4 },
  input: { backgroundColor: '#fff', padding: theme.spacing.md, borderRadius: 28, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.outline },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  remember: { marginRight: 8, color: theme.colors.onSurfaceVariant },
  forgot: { color: theme.colors.primary },
  loginBtn: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 28, marginTop: theme.spacing.md, alignItems: 'center' },
  loginText: { color: theme.colors.onPrimary, fontWeight: '700' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.md },
  caption: { color: theme.colors.onSurfaceVariant },
  signupLink: { color: theme.colors.primary },
  error: { color: theme.colors.error, textAlign: 'center', marginTop: theme.spacing.xs }
});