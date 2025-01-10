import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authStyles as styles } from '../styles/components/auth.styles';

export default function StudentLogin() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Login</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          keyboardType="default"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push("/student/dashboard")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 