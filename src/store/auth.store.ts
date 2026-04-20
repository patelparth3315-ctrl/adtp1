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
  admin: {
    id: "bypass_admin",
    name: "System Admin (Bypass)",
    email: "admin@youthcamping.in",
    role: "superadmin"
  },
  isAuthenticated: true,
  isLoading: false,

  login: async (email, password) => {
    // Mock login success
    set({ 
      admin: { id: "bypass", name: "Bypass Admin", email, role: "superadmin" }, 
      isAuthenticated: true, 
      isLoading: false 
    });
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    set({ admin: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    // Always authenticated for now
    set({ isAuthenticated: true, isLoading: false });
  },
}));
