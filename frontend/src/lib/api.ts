import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function callRefresh(): Promise<string> {
  const resp = await axios.post(
    `${baseURL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return resp.data.token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = callRefresh()
            .then((newToken) => {
              localStorage.setItem("auth_token", newToken);
              return newToken;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        const newToken = await (refreshPromise as Promise<string>);
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
