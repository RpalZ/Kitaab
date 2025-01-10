import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { COLORS } from "./styles/theme";

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add your fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.text.light,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="teacher/login" options={{ title: 'Teacher Login' }} />
      <Stack.Screen name="teacher/dashboard" options={{ title: 'Teacher Dashboard' }} />
      <Stack.Screen name="student/login" options={{ title: 'Student Login' }} />
      <Stack.Screen name="student/dashboard" options={{ title: 'Student Dashboard' }} />
    </Stack>
  );
}
