import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import NoticesScreen from './src/screens/NoticesScreen';
import LostFoundScreen from './src/screens/LostFoundScreen';
import StudyGroupsScreen from './src/screens/StudyGroupsScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import EventsScreen from './src/screens/EventsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import ReportFoundScreen from './src/screens/ReportFoundScreen';
import UploadResourceScreen from './src/screens/UploadResourceScreen';
import SignupScreen from './src/screens/SignupScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Notices"
      screenOptions={{
        headerStyle: { backgroundColor: '#0b1220' },
        headerTintColor: '#fff',
        drawerActiveBackgroundColor: '#16233a',
        drawerActiveTintColor: '#dbe5ff',
        drawerInactiveTintColor: '#c8d0e0',
      }}
    >
      <Drawer.Screen name="Notices" component={NoticesScreen} options={{ drawerIcon: ({ color, size }) => (<Ionicons name="notifications-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="Lost & Found" component={LostFoundScreen} options={{ drawerIcon: ({ color, size }) => (<Ionicons name="search-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="Study Groups" component={StudyGroupsScreen} options={{ drawerIcon: ({ color, size }) => (<Ionicons name="people-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="Resources" component={ResourcesScreen} options={{ drawerIcon: ({ color, size }) => (<Ionicons name="folder-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="Events" component={EventsScreen} options={{ drawerIcon: ({ color, size }) => (<Ionicons name="calendar-outline" color={color} size={size} />) }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerIcon: ({ color, size }) => (<Ionicons name="settings-outline" color={color} size={size} />) }} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="GetStarted" component={GetStartedScreen} />
          <Stack.Screen name="Main" component={MainDrawer} />
          <Stack.Screen name="ReportFound" component={ReportFoundScreen} />
          <Stack.Screen name="UploadResource" component={UploadResourceScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
