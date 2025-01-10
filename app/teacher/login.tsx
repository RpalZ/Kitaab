import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authStyles as styles } from '../styles/components/auth.styles';
import { COLORS } from '../styles/theme';

export default function TeacherLogin() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Login</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.text.secondary}
          keyboardType="email-address"
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
          onPress={() => router.push("/teacher/dashboard")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 