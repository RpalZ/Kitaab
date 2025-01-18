import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authStyles as styles } from '../styles/components/auth.styles';
import { COLORS } from '../styles/theme';

export default function StudentLogin() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>Student Login</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          placeholderTextColor={COLORS.text.secondary}
          keyboardType="default"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.text.secondary}
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