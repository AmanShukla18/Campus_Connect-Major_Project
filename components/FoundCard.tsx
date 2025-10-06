import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../lib/theme';

export type FoundItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  contact?: string;
  date: string;
  imageUri?: string;
  ownerEmail?: string; // who reported/owns this found item
};

export default function FoundCard({
  item,
  onPress,
  isOwner,
  onMarkDone
}: {
  item: FoundItem;
  onPress?: () => void;
  isOwner?: boolean;
  onMarkDone?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card} accessibilityRole="button">
      <View style={styles.row}>
        <View style={styles.thumbnailContainer}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={28} color={theme.colors.onSurfaceVariant} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.headerRight}>
              <Text style={styles.date}>{item.date}</Text>
              {/* show mark-as-done only to owner */}
              {isOwner && onMarkDone ? (
                <TouchableOpacity style={styles.doneButton} onPress={onMarkDone} accessibilityRole="button">
                  <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {item.location ? <Text style={styles.meta}>Location: {item.location}</Text> : null}
          {item.contact ? <Text style={styles.meta}>Contact: {item.contact}</Text> : null}
          {item.description ? <Text style={styles.excerpt} numberOfLines={2}>{item.description}</Text> : null}
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  thumbnailContainer: {
    width: 72,
    height: 72,
    marginRight: theme.spacing.sm
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant
  },
  placeholder: {
    width: 72,
    height: 72,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: theme.typography.title,
    color: theme.colors.onSurface,
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm
  },
  date: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.typography.caption
  },
  doneButton: {
    marginLeft: theme.spacing.sm,
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant
  },
  meta: {
    marginTop: 6,
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.typography.caption
  },
  excerpt: {
    marginTop: 8,
    color: theme.colors.onSurface,
    fontSize: theme.typography.body
  }
});