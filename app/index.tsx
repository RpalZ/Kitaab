import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { SplashScreen } from 'app/components/SplashScreen';
import { useRouter } from "expo-router";
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Text, TouchableOpacity, View } from "react-native";
import { homeStyles as styles } from "./styles/components/home.styles";
import { COLORS } from "./styles/theme";
import { AuthUtils } from './utils/auth';
import { secureStorage } from './utils/secureStorage';

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const fallAnim = useRef(new Animated.Value(-200)).current;
  const buttonsFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(fallAnim, {
        toValue: 0,
        tension: 20,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.sequence([
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
        Animated.timing(fadeAnim, {
          toValue: 0.2,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 30,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonsFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        try {
          const role = await AuthUtils.getCurrentUserRole();
          if (role === 'teacher') {
            router.replace('/teacher/dashboard');
          } else if (role === 'student') {
            router.replace('/student/dashboard');
          } else {
            console.error('Unknown user role');
            await FIREBASE_AUTH.signOut();
            await secureStorage.removeItem('userToken');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          await FIREBASE_AUTH.signOut();
          await secureStorage.removeItem('userToken');
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View 
          style={[
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: fallAnim }
              ]
            }
          ]}
        >
          <Image
            source={require("../assets/images/kitaablogowhite.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: buttonsFadeAnim }]}>
          Kitaab
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: buttonsFadeAnim }]}>
          Choose your role to get started
        </Animated.Text>
      </View>

      <Animated.View 
        style={[
          styles.buttonContainer,
          {
            opacity: buttonsFadeAnim,
            transform: [{
              translateY: buttonsFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }]
          }
        ]}
      >
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
      </Animated.View>
    </View>
  );
}
