import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox, Platform } from "react-native";


import { secureStorage } from "./utils/secureStorage";

LogBox.ignoreLogs([
  "Warning: ...", // Add specific warning messages here
  "Deprecated: ...",
]);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await secureStorage.getItem('userToken');
      if (!token) {
        router.replace('/');
        return;
      }
      // Verify token with Firebase
      return onAuthStateChanged(FIREBASE_AUTH, (user) => {
        setUser(user);
        setLoading(false);
        if (!user) {
          secureStorage.removeItem('userToken');
          router.replace('/');
        }
      });
    };

    checkAuth();
  }, []);

  if (loading) return <ActivityIndicator />;
  return user ? children : null;
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // animation: "fade",
        animationDuration: 200,
        contentStyle: {
          backgroundColor: Platform.OS === 'ios' ? '#000000' : undefined,
        },
        presentation: "card",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animationTypeForReplace: "push",
        animation: Platform.select({
          ios: "fade",
          android: "fade",
        }),
        transitionSpec: {
          open: {
            animation: "timing",
            config: {
              duration: 300,
            },
          },
          close: {
            animation: "timing",
            config: {
              duration: 300,
            },
          },
        },
        cardStyleInterpolator: ({ current, next, layouts } : any) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
            overlayStyle: {
              opacity: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          };
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="student/login" options={{ headerShown: false }} />
      <Stack.Screen name="teacher/login" options={{ headerShown: false }} />
      <Stack.Screen 
        name="teacher/dashboard" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="teacher/profile" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="student/dashboard" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />

      <Stack.Screen
        name="teacher/forum"
        options={{ 
          title: "Teacher Forum",
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="student/dashboard"
        options={{ title: "Student Dashboard" }}
      /> */}
      <Stack.Screen

        name="teacher/class/[id]"
        options={{ 
          title: "Class Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
    name="teacher/chat"
    options={{
      headerShown: false,
      gestureEnabled: false,
    }}
      />
    <Stack.Screen 
        name="student/profile" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="student/classes" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="student/resources" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="teacher/classes" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
    </Stack>
    

  

  );
}
