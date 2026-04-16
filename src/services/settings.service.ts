import api from "./api";
import type { SiteSettings } from "@/types";

export const settingsService = {
  async get(): Promise<SiteSettings> {
    const res = await api.get("/settings");
    return res.data.data;
  },

  async update(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await api.put("/settings", data);
    return res.data.data;
  },
};
