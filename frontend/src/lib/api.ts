// frontend/src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api"; // 推荐从 env 读，fallback /api

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 如果需要 cookie/session
});

// === 开发辅助：默认注入 x-user header（只在本地/开发用） ===
// 这样后端 authMiddleware 在开发时能识别当前用户，生产请移除或换成真实 auth
if (import.meta.env.DEV) {
  const devUser = {
    username: "employee",
    role: "employee",
  };

  api.defaults.headers.common["x-user"] = JSON.stringify(devUser);
}

export { API_BASE };
export default api;
