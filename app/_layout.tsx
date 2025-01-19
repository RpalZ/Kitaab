import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox } from "react-native";
import Home from "./index";
import StudentDashboard from "./student/dashboard";
import StudentLogin from "./student/login";
import { COLORS } from "./styles/theme";
import TeacherDashboard from "./teacher/dashboard";
import TeacherLogin from "./teacher/login";
import { secureStorage } from "./utils/secureStorage";
import ClassDetail from "./teacher/class/[id]";

// Ignore specific warnings
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
        name="student/dashboard"
        options={{ title: "Student Dashboard" }}
        component={StudentDashboard}
      />
      <Stack.Screen
        name="teacher/class/[id]"
        options={{ title: "Class Details" }}
        component={ClassDetail}
      />
    </Stack.Navigator>
  );
}
