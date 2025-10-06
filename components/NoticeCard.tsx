// New file: components/NoticeCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../lib/theme';

export type Notice = {
  id: string;
  title: string;
  department: string;
  type: string;
  date: string;
  excerpt?: string;
  imageUri?: string;
};

export default function NoticeCard({ notice, onPress, onQRCodePress }: { notice: Notice; onPress?: () => void; onQRCodePress?: () => void; }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={styles.row}>
        <View style={styles.thumbnailContainer}>
          {notice.imageUri ? (
            <Image source={{ uri: notice.imageUri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="document-text-outline" size={28} color={theme.colors.onSurfaceVariant} />
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{notice.title}</Text>
            <TouchableOpacity onPress={onQRCodePress} style={styles.qrButton} accessibilityLabel="Open QR code">
              <Ionicons name="qr-code-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.meta}>{notice.department} • {notice.type} • {notice.date}</Text>
          {notice.excerpt ? <Text style={styles.excerpt}>{notice.excerpt}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  thumbnailContainer: {
    width: 64,
    height: 64,
    marginRight: theme.spacing.sm
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: theme.typography.title,
    color: theme.colors.onSurface,
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm
  },
  qrButton: {
    padding: 6
  },
  meta: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.typography.caption,
    marginTop: 4
  },
  excerpt: {
    marginTop: 8,
    color: theme.colors.onSurface,
    fontSize: theme.typography.body
  }
});