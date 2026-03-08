import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  withCredentials: true, // send/receive httpOnly cookies
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("hp_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hp_token");
      localStorage.removeItem("hp_user");
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  getMe: () => API.get("/auth/me"),
};

export default API;
