import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { homeStyles as styles } from "./styles/components/home.styles";
import { COLORS } from "./styles/theme";

// Sample class data - in a real app, this would come from your backend
const sampleClasses = [
  {
    id: 1,
    name: "Mathematics 101",
    studentCount: 25,
    resourceCount: 15,
    progress: "75%"
  },
  {
    id: 2,
    name: "Physics Advanced",
    studentCount: 18,
    resourceCount: 12,
    progress: "60%"
  },
  {
    id: 3,
    name: "Chemistry Basics",
    studentCount: 22,
    resourceCount: 8,
    progress: "45%"
  }
];

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

