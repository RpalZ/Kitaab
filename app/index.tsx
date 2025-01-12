import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { homeStyles as styles } from "./styles/components/home.styles";
import { COLORS } from "./styles/theme";


export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kitaab</Text>
        <Text style={styles.subtitle}>Choose your role to get started</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: COLORS.primary }]}
          onPress={() => router.push("/teacher/login")}
        >
          <Text style={styles.buttonText}>I'm a Teacher</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: COLORS.secondary }]}
          onPress={() => router.push("/student/login")}
        >
          <Text style={styles.buttonText}>I'm a Student</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
