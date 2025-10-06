// New file: screens/EventCalendarScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../lib/theme';

const MOCK_EVENTS = [
  { id: 'e1', title: 'Freshers Orientation', date: '2025-09-01', location: 'Main Hall' },
  { id: 'e2', title: 'Hackathon', date: '2025-10-14', location: 'Lab 3' }
];

export default function EventCalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.subtitle}>Campus events and activities</Text>
      </View>

      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 48 }}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventMeta}>{item.date} • {item.location}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => { /* open add event */ }}>
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  header: { marginBottom: theme.spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.onSurface },
  subtitle: { color: theme.colors.onSurfaceVariant },
  eventCard: { backgroundColor: 'white', padding: theme.spacing.md, borderRadius: theme.radii.sm, marginBottom: theme.spacing.sm },
  eventTitle: { fontWeight: '700', color: theme.colors.onSurface },
  eventMeta: { marginTop: 4, color: theme.colors.onSurfaceVariant },
  addButton: { position: 'absolute', right: theme.spacing.md, bottom: theme.spacing.md, backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999 },
  addButtonText: { color: theme.colors.onPrimary, fontWeight: '700' }
});