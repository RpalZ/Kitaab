import { COLORS } from 'app/styles/theme';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 120; // Match the logo size from home.styles
const FINAL_LOGO_SIZE = LOGO_SIZE; // Keep same size as home page
const HEADER_PADDING = Platform.OS === 'ios' ? 60 : 16;

type SplashScreenProps = {
  onAnimationComplete: () => void;
};

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const logoPosition = useRef(new Animated.ValueXY({
    x: 0,
    y: 0
  })).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const centerX = (width - LOGO_SIZE) / 2;
    const startY = (height - LOGO_SIZE) / 2;
    const finalY = HEADER_PADDING + 120;

    logoPosition.setValue({
      x: centerX,
      y: startY
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
    
        Animated.timing(logoPosition.y, {
          toValue: finalY,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
    
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
        
        Animated.sequence([
          Animated.delay(1000), 
          Animated.timing(logoOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      onAnimationComplete();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: fadeAnim,
          },
        ]}
      />
      <Animated.Image
        source={require('../../assets/images/kitaablogowhite.png')}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [
              { translateX: logoPosition.x },
              { translateY: logoPosition.y },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    resizeMode: 'contain',
    position: 'absolute',
  },
}); 