// New file: screens/NoticeBoardScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../lib/theme';
import NoticeCard, { Notice } from '../components/NoticeCard';

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'Semester Exams Timetable Released',
    department: 'Computer Science',
    type: 'Exam',
    date: '2025-10-02',
    excerpt: 'Final semester exam timetable is now available. Please check your subject codes and venues.'
  },
  {
    id: '2',
    title: 'Guest Lecture: AI in Healthcare',
    department: 'Biomedical Engineering',
    type: 'Event',
    date: '2025-09-28',
    excerpt: 'Join us for a talk by Dr. Adebayo on AI applications in medicine.'
  },
  {
    id: '3',
    title: 'Campus Maintenance - Water Shutdown',
    department: 'All',
    type: 'General',
    date: '2025-09-20',
    excerpt: 'Water supply will be shut down between 9am-3pm for maintenance.'
  }
];

export default function NoticeBoardScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const departments = useMemo(() => ['All', 'Computer Science', 'Biomedical Engineering', 'Electrical'], []);
  const types = useMemo(() => ['All', 'Exam', 'Event', 'General'], []);

  const filtered = useMemo(() => {
    return MOCK_NOTICES.filter(n => {
      if (activeFilter && activeFilter !== 'All' && n.department !== activeFilter && n.type !== activeFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return n.title.toLowerCase().includes(q) || (n.excerpt || '').toLowerCase().includes(q) || n.department.toLowerCase().includes(q);
    });
  }, [query, activeFilter]);

  return (
    <SafeAreaView style={styles.container} edges={[ 'top' ]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notices</Text>
        <Text style={styles.headerSubtitle}>Department-wise, real-time notices</Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          placeholder="Search notices, keywords, department..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          accessibilityLabel="Search notices"
        />

        <View style={styles.chipsRow}>
          {types.map(t => (
            <TouchableOpacity key={t} onPress={() => setActiveFilter(prev => prev === t ? null : t)} style={[styles.chip, activeFilter === t && styles.chipActive]}>
              <Text style={[styles.chipText, activeFilter === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NoticeCard
            notice={item}
            onPress={() => { /* placeholder: open detail modal */ }}
            onQRCodePress={() => { /* placeholder: show QR modal */ }}
          />
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No notices match your search.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md
  },
  header: {
    paddingVertical: theme.spacing.lg
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.onSurface
  },
  headerSubtitle: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant
  },
  controls: {
    marginBottom: theme.spacing.sm
  },
  search: {
    backgroundColor: 'white',
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.body,
    color: theme.colors.onSurface
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    flexWrap: 'wrap'
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 999,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs
  },
  chipActive: {
    backgroundColor: theme.colors.primary
  },
  chipText: {
    color: theme.colors.onSurface,
    fontSize: theme.typography.caption
  },
  chipTextActive: {
    color: theme.colors.onPrimary
  },
  list: {
    paddingVertical: theme.spacing.sm,
    paddingBottom: 80
  },
  empty: {
    marginTop: theme.spacing.lg,
    alignItems: 'center'
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant
  }
});