import api from "./api";
import type { Admin, AuthResponse } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post("/admin/login", { email, password });
    return res.data.data;
  },

  async getMe(): Promise<Admin> {
    const res = await api.get("/admin/me");
    return res.data.data;
  },

  logout() {
    localStorage.removeItem("admin_token");
  },
};
