import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useState } from "react";
import { LogBox } from "react-native";
import { COLORS } from "./styles/theme";
import {
  createStaticNavigation,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TeacherDashboard from "./teacher/dashboard";
import forum from "./teacher/forum";
import TeacherLogin from "./teacher/login";
import StudentLogin from "./student/login";
import Home from "./index";
import StudentDashboard from "./student/dashboard";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import Forum from "./teacher/forum";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Warning: ...", // Add specific warning messages here
  "Deprecated: ...",
]);

export default function Layout() {

  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text.light,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
        component={Home}
      />
      <Stack.Screen
        name="student/login"
        options={{ title: "Student Login" }}
        component={StudentLogin}
      />
      <Stack.Screen
        name="teacher/login"
        options={{ title: "Teacher Login" }}
        component={TeacherLogin}
      />
      <Stack.Screen
        name="teacher/dashboard"
        options={{ title: "Teacher Dashboard" }}
        component={TeacherDashboard}
      />
      <Stack.Screen
        name="teacher/forum"
        options={{ title: "Teacher Forum" }}
        component={Forum}
      />
      <Stack.Screen
        name="student/dashboard"
        options={{ title: "Student Dashboard" }}
        component={StudentDashboard}
      />
    </Stack.Navigator>
  );
}
