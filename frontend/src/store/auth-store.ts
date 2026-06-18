import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isBootstrapped: boolean;
  setSession: (accessToken: string, user?: AuthUser | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setBootstrapped: (isBootstrapped: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isBootstrapped: false,
  setSession: (accessToken, user) =>
    set((state) => ({
      accessToken,
      user: user === undefined ? state.user : user,
    })),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setBootstrapped: (isBootstrapped) => set({ isBootstrapped }),
  clearSession: () => set({ accessToken: null, user: null }),
}));
