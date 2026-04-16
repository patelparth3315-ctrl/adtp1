import { create } from "zustand";
import type { Admin } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: { id: "dev", name: "Dev Mode", email: "dev@local", role: "superadmin" },
  isAuthenticated: true,
  isLoading: false,

  login: async (email, password) => {
    const { token, admin } = await authService.login(email, password);
    localStorage.setItem("admin_token", token);
    set({ admin, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    authService.logout();
    set({ admin: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const admin = await authService.getMe();
      set({ admin, isAuthenticated: true, isLoading: false });
    } catch {
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
