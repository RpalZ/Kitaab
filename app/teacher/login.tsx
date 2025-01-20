import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { authStyles as styles } from "../styles/components/auth.styles";
import { COLORS } from "../styles/theme";
import { secureStorage } from '../utils/secureStorage';

const Stack = createNativeStackNavigator();

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();

  useEffect(() => {
    const loginStatus = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/teacher/dashboard");
      }
    });
    return () => loginStatus();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const token = await response.user.getIdToken();
      await secureStorage.setItem('userToken', token);
      
      console.log(response);
      alert("Successful signin");
      router.push("/teacher/dashboard");

    } catch (error:any) {
      console.log(error);
      alert(`Sign in Failed: ${error.message}`);
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
      console.log(response);
      alert("check email");

    } catch (error:any) {
      console.log(error);
      alert(`Sign in Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>Teacher Login</Text>

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
          <ActivityIndicator color="#0000ff" />
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
