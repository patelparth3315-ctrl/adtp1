import api from "./api";
import type { Booking } from "@/types";

export const bookingsService = {
  async getAll(): Promise<Booking[]> {
    const res = await api.get("/bookings");
    return res.data.data;
  },

  async getById(id: string): Promise<Booking> {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data;
  },

  async create(data: any): Promise<Booking> {
    const res = await api.post("/bookings", data);
    return res.data.data;
  },

  async update(id: string, data: any): Promise<Booking> {
    const res = await api.put(`/bookings/${id}`, data);
    return res.data.data;
  },

  async updateStatus(id: string, status: Booking["status"]): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/status`, { status });
    return res.data.data;
  },

  async retrySync(id: string): Promise<any> {
    const res = await api.patch(`/bookings/${id}/retry-sync`);
    return res.data.data;
  },

  async markAsFullyPaid(id: string): Promise<Booking> {
    const res = await api.patch(`/bookings/${id}/status`, { paymentStatus: 'paid' });
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`);
  },
};
