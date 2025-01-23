import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { SplashScreen } from 'app/components/SplashScreen';
import { useRouter } from "expo-router";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Text, TouchableOpacity, View } from "react-native";
import { homeStyles as styles } from "./styles/components/home.styles";
import { COLORS } from "./styles/theme";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleAnimationComplete = () => {
    // Create a flickering sequence
    Animated.sequence([
      // Initial fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
      // First flicker
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      // Second flicker
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 40,
        useNativeDriver: true,
      }),
      // Final quick flicker
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 30,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 30,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSplash(false);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        if (user.email?.includes('teacher')) {
          router.replace('/teacher/dashboard');
        } else {
          router.replace('/student/dashboard');
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      {showSplash && (
        <SplashScreen
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      <View style={styles.header}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={require("../assets/images/kitaablogowhite.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
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
