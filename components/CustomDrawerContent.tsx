import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import theme from '../lib/theme';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const AVATAR_SIZE = 64;

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut, userEmail, profilePicUri } = useAuth();
  const { colors } = useTheme();
  // Simple non-animated entrance (animations cause complex typing issues in TS without extra typings)
  const headerOpacity = 1;
  const headerTranslateX = 0;
  const listOpacity = 1;
  const listTranslateX = 0;

  const initials = (userEmail || 'U')
    .split('@')[0]
    .split(/[^a-zA-Z0-9]/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    // close drawer first for smoother UX
    if (props?.navigation?.closeDrawer) props.navigation.closeDrawer();
    // small delay so drawer close animation is visible
    setTimeout(() => {
      if (typeof signOut === 'function') signOut();
    }, 180);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={[styles.container, { backgroundColor: colors.surface }]}>
      <View>
  <View style={[styles.header, { opacity: headerOpacity, transform: [{ translateX: headerTranslateX }], backgroundColor: colors.surfaceVariant }]}>
          {profilePicUri ? (
            <Image source={{ uri: profilePicUri }} style={styles.avatar} accessibilityLabel="user-avatar" />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]} accessibilityLabel="user-avatar">
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text numberOfLines={1} style={[styles.userName, { color: colors.onSurface }]}>{userEmail ? userEmail : 'Welcome'}</Text>
            <Text numberOfLines={1} style={[styles.userMeta, { color: colors.onSurfaceVariant }]}>Student community • Member</Text>
          </View>
        </View>

        <View style={{ marginTop: 12, opacity: listOpacity, transform: [{ translateX: listTranslateX }] }}>
          <DrawerItemList {...props} />
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.outline }]}>
        <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: colors.surface }]} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={18} color={colors.error} style={{ marginRight: 10 }} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceVariant
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
    fontSize: 20
  },
  userInfo: {
    marginLeft: theme.spacing.md,
    flex: 1
  },
  userName: {
    color: theme.colors.onSurface,
    fontSize: theme.typography.title,
    fontWeight: '600'
  },
  userMeta: {
    color: theme.colors.onSurfaceVariant,
    fontSize: theme.typography.caption,
    marginTop: 4
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: theme.spacing.sm
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    // subtle elevation for iOS/Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.typography.body,
    fontWeight: '600'
  }
});