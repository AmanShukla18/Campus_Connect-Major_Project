// New file: screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import theme from '../lib/theme';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { finishOnboarding } = useAuth();
  const imageSource = { uri: 'https://www.enseignementsup-recherche.gouv.fr/sites/default/files/styles/full_width/public/2021-09/mesri-campus-connect-01-10793.jpg?itok=-hikQVGP' };

  return (
    <View style={styles.container}>
      <Text style={styles.smallHeader}>Welcome to</Text>
      <Text style={styles.header}>CampusConnect</Text>

      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      <Text style={styles.title}>The Ultimate College Utility App</Text>
      <Text style={styles.subtitle}>Simplify campus life with all-in-one communication, collaboration, and organization tools.</Text>

      <TouchableOpacity style={styles.getStarted} onPress={finishOnboarding} accessibilityRole="button">
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.lg, justifyContent: 'center' },
  smallHeader: { textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 6 },
  header: { textAlign: 'center', fontSize: 20, fontWeight: '700', marginBottom: theme.spacing.lg, color: theme.colors.onSurface },
  image: { width: width - theme.spacing.lg * 2, height: 220, borderRadius: theme.radii.lg, alignSelf: 'center', marginBottom: theme.spacing.lg },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: theme.spacing.sm, color: theme.colors.onSurface },
  subtitle: { textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: theme.spacing.lg, paddingHorizontal: 12 },
  getStarted: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 28, marginHorizontal: 8 },
  getStartedText: { textAlign: 'center', color: theme.colors.onPrimary, fontWeight: '700' }
});