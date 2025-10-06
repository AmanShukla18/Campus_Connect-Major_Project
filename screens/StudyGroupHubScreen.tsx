// New file: screens/StudyGroupHubScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../lib/theme';

const MOCK_GROUPS = [
  { id: 'g1', name: 'Calculus II - Group A', subject: 'Mathematics', members: 12 },
  { id: 'g2', name: 'Data Structures', subject: 'Computer Science', members: 8 }
];

export default function StudyGroupHubScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Groups</Text>
        <Text style={styles.subtitle}>Join subject-wise groups or create your own</Text>
      </View>

      <FlatList
        data={MOCK_GROUPS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 48 }}
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupMeta}>{item.subject} • {item.members} members</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.createButton} onPress={() => { /* open create modal */ }}>
        <Text style={styles.createButtonText}>Create / Join Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm
  },
  header: {
    marginBottom: theme.spacing.sm
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.onSurface
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant
  },
  groupCard: {
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.sm
  },
  groupName: {
    fontWeight: '700',
    color: theme.colors.onSurface
  },
  groupMeta: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant
  },
  createButton: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999
  },
  createButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: '700'
  }
});