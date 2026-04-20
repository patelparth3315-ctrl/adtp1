import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8888/api";
console.log("🚀 CRM API ROUTE:", API_BASE);


const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const normalizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(normalizeData);
  
  const normalized: any = { ...data };
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id;
  }
  
  Object.keys(normalized).forEach(key => {
    normalized[key] = normalizeData(normalized[key]);
  });
  
  return normalized;
};

api.interceptors.response.use(
  (res) => {
    if (res.data && res.data.data) {
      res.data.data = normalizeData(res.data.data);
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default api;
