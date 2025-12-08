
import { useColorScheme } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from 'react-redux';
import { store } from '../src/store';
import '../src/utils/i18n';
import { restoreAuth } from '../src/store/slices/authSlice';
import { getStoredAuthState } from '../src/services/authService';
import CustomSplashScreen from '../components/SplashScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AuthRestorer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const authUser = await getStoredAuthState();
        if (authUser) {
          // Auth user already has name from Firestore or storage
          dispatch(restoreAuth(authUser));
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
      }
    };

    restoreAuthState();
  }, [dispatch]);

  return null;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [showSplash, setShowSplash] = useState(true);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (showSplash) {
    return <CustomSplashScreen onAnimationEnd={() => setShowSplash(false)} />;
  }

  return (
    <Provider store={store}>
      <AuthRestorer />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <SystemBars style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/verify-otp" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="crop-disease" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
