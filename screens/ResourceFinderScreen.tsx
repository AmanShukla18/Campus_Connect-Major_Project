// New file: screens/ResourceFinderScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../lib/theme';

const MOCK_RESOURCES = [
  { id: 'r1', title: 'Algorithms - Lecture Notes', subject: 'Computer Science', year: '2024' },
  { id: 'r2', title: 'Physics Past Paper', subject: 'Physics', year: '2023' }
];

export default function ResourceFinderScreen() {
  const [query, setQuery] = useState('');
  const filtered = MOCK_RESOURCES.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.subject.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Search notes, papers, and circulars</Text>
      </View>

      <TextInput value={query} onChangeText={setQuery} placeholder="Search by title, subject, year..." placeholderTextColor={theme.colors.onSurfaceVariant} style={styles.search} />

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 48 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resourceCard} onPress={() => { /* open preview */ }}>
            <Text style={styles.resourceTitle}>{item.title}</Text>
            <Text style={styles.resourceMeta}>{item.subject} • {item.year}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  header: { marginBottom: theme.spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.onSurfaceVariant },
  search: { backgroundColor: 'white', borderRadius: theme.radii.sm, padding: theme.spacing.sm, marginBottom: theme.spacing.sm, color: theme.colors.onSurface },
  resourceCard: { backgroundColor: 'white', padding: theme.spacing.md, borderRadius: theme.radii.sm, marginBottom: theme.spacing.sm },
  resourceTitle: { fontWeight: '700', color: theme.colors.onSurface },
  resourceMeta: { marginTop: 4, color: theme.colors.onSurfaceVariant }
});