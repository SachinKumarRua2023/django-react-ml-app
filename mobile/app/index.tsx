// mobile/app/index.tsx
// Required by Expo Router — immediately hands control to AppNavigator
// Do NOT put any UI here; _layout.tsx handles everything

import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  // Nothing renders here — _layout.tsx takes over immediately
  return null;
}