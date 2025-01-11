import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authStyles as styles } from "../styles/components/auth.styles";
import { COLORS } from "../styles/theme";
import { useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function TeacherLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error) {
      console.log(error);
      alert("Sign In failed");
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
    } catch (error) {
      console.log(error);
      alert(`Sign in Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
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
