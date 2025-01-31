import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authStyles as styles } from "../styles/components/auth.styles";
import { COLORS } from "../styles/theme";
import { AuthUtils } from "../utils/auth";
import { secureStorage } from "../utils/secureStorage";

const Stack = createNativeStackNavigator();

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  useEffect(() => {
    const loginStatus = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/student/dashboard");
      }
    });
    return () => loginStatus();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      await AuthUtils.signInWithRole(email, password, "student");
      const token = await FIREBASE_AUTH.currentUser?.getIdToken();
      if (token) {
        await secureStorage.setItem("userToken", token);
        router.replace("/student/dashboard");
      }
    } catch (error: any) {
      console.error("Sign in failed:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await AuthUtils.createUserProfile(response.user.uid, email, "student");
      await updateProfile(response.user, {
        displayName: email.split("@")[0],
      });
      console.log("Student account created:", response.user.email);
      router.replace("/student/dashboard");
    } catch (error: any) {
      console.error("Sign up failed:", error);
      alert(`Sign up Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>Student Login</Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.text.secondary}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.text.secondary}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
        />
        {loading ? (
          <ActivityIndicator color={COLORS.text.primary} />
        ) : (
          <>
            <TouchableOpacity
              // login Button
              style={styles.button}
              onPress={signIn}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              // login Button
              style={styles.button}
              onPress={signUp}
            >
              <Text style={styles.buttonText}>Create account</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
