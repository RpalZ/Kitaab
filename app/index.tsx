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
  const fallAnim = useRef(new Animated.Value(-300)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const buttonsFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(fallAnim, {
          toValue: 0,
          tension: 15,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 20,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 20,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(buttonsFadeAnim, {
        toValue: 1,
        tension: 65,
        friction: 5,
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
                { translateY: fallAnim },
                { scale: scaleAnim },
                {
                  rotate: fallAnim.interpolate({
                    inputRange: [-300, 0],
                    outputRange: ['-10deg', '0deg'],
                  })
                }
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
        <Animated.Text 
          style={[
            styles.title, 
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
          Kitaab
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle, 
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
                outputRange: [30, 0],
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
