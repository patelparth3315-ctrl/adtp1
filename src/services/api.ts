import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001').replace(/\/api$/, '') + '/api'
});

api.interceptors.request.use((config) => {
  // As per requirement, use 'token' key instead of 'admin_token'
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401 Handling: Session expired or unauthorized
    if (err.response?.status === 401) {
      console.warn("🔐 Session expired - Clearing token and redirecting");
      localStorage.removeItem('token');
      
      // Redirect to login (assuming standard path /login as per prompt)
      if (typeof window !== 'undefined' && !window.location.pathname.includes("/login")) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export { api };
export default api;
