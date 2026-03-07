// mobile/src/store/authStore.ts
// Replaces: localStorage.getItem("cosmos_token") + localStorage.getItem("cosmos_user")
// Uses: expo-secure-store (encrypted) + zustand (reactive state)

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "cosmos_token";
export const USER_KEY = "cosmos_user";

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  loadUser: () => Promise<void>;
  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  // Called once on app boot — replaces your useEffect checkAuth interval
  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);

      if (token && userData) {
        set({
          token,
          user: JSON.parse(userData),
          isLoading: false,
        });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch {
      set({ token: null, user: null, isLoading: false });
    }
  },

  // Called after successful login/signup
  setAuth: async (token: string, user: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },

  // Called on logout
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },
}));