// mobile/src/components/ui/LoadingScreen.tsx
// Shows on boot while SecureStore is being read
// Replaces: nothing in web (web had instant localStorage reads)

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS, FONTS, SPACING } from "../../constants/theme";

export function LoadingScreen() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: pulse }]}>
        🧠
      </Animated.Text>
      <Text style={styles.title}>Cosmos RUA</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

// Named export for _layout, default export for navigation stacks
export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.textPrimary,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});