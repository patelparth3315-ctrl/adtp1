import api from "./api";

export const settingsService = {
  async get() {
    const res = await api.get("/settings");
    return res.data.data;
  },

  async update(data: any) {
    const res = await api.put("/settings", data);
    return res.data.data;
  }
};
