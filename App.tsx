// Must be at the top — gesture handler needs to be imported before other libraries
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from './components/CustomDrawerContent';

import NoticeBoardScreen from './screens/NoticeBoardScreen';
import LostAndFoundScreen from './screens/LostAndFoundScreen';
import StudyGroupHubScreen from './screens/StudyGroupHubScreen';
import ResourceFinderScreen from './screens/ResourceFinderScreen';
import EventCalendarScreen from './screens/EventCalendarScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import theme from './lib/theme';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AppDrawer() {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      initialRouteName="Notices"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      drawerType="slide"
      overlayColor="rgba(11,18,32,0.25)"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface, elevation: 0 },
        headerTitleAlign: 'center',
        headerTitleStyle: { color: colors.onSurface },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 12 }} accessibilityRole="button">
            <Ionicons name="menu" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        ),
        drawerStyle: { backgroundColor: colors.surface, width: 300 },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.onSurfaceVariant
      })}
    >
      <Drawer.Screen name="Notices" component={NoticeBoardScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="megaphone-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Lost & Found" component={LostAndFoundScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="search-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Study Groups" component={StudyGroupHubScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="people-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Resources" component={ResourceFinderScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="folder-open-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Events" component={EventCalendarScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="calendar-outline" size={20} color={color} /> }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={20} color={color} /> }} />
    </Drawer.Navigator>
  );
}

function RootNavigation() {
  const { isAuthenticated, pendingWelcome } = useAuth();

  if (!isAuthenticated && pendingWelcome) {
    // show Welcome screen
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      </Stack.Navigator>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return <AppDrawer />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp() {
  const { colors, scheme } = useTheme();
  const navTheme = {
    ...NavigationDefaultTheme,
    colors: { ...NavigationDefaultTheme.colors, background: colors.surface }
  };

  return (
    <NavigationContainer theme={navTheme} children={<>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
      <RootNavigation />
    </>} />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});