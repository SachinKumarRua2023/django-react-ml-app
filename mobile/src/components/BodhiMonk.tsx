// mobile/src/components/BodhiMonk.tsx
// Reusable BodhiMonk avatar / indicator component
// Used in MasterRua.tsx and TalkWithRua.tsx

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS, RADIUS } from "../constants/theme";

interface Props {
  speaking?: boolean;
  size?:     number;
}

export function BodhiMonk({ speaking = false, size = 80 }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (speaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [speaking]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: size / 2 },
          speaking && styles.orbSpeaking,
          { transform: [{ scale: pulse }] },
        ]}
      >
        <Text style={{ fontSize: size * 0.5 }}>🧙‍♂️</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:     { alignItems: "center" },
  orb:         { backgroundColor: "rgba(102,0,255,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: COLORS.border },
  orbSpeaking: { borderColor: COLORS.cyan, backgroundColor: "rgba(0,245,255,0.1)" },
});