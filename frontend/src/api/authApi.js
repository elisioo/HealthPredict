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
  updateStatus: (status) => API.patch("/auth/status", { status }),
};

export const messageApi = {
  getInbox: () => API.get("/messages/inbox"),
  getStaffList: () => API.get("/messages/staff"),
  getUnreadCount: () => API.get("/messages/unread"),
  getConversation: (userId) => API.get(`/messages/${userId}`),
  sendMessage: (data) => API.post("/messages", data),
};

export const predictionApi = {
  getHistory: () => API.get("/predictions/history"),
};

export const profileApi = {
  getHealthProfile: () => API.get("/profile/health"),
  updateHealthProfile: (data) => API.put("/profile/health", data),
};

export const appointmentApi = {
  getMyAppointments: () => API.get("/appointments/my"),
  getStaffAppointments: () => API.get("/appointments/staff"),
  getAllAppointments: () => API.get("/appointments/all"),
  getStaffList: () => API.get("/appointments/staff-list"),
  bookAppointment: (data) => API.post("/appointments", data),
  updateStatus: (id, status) =>
    API.patch(`/appointments/${id}/status`, { status }),
};

export const adminApi = {
  getUsers: (params) => API.get("/admin/users", { params }),
  getStats: () => API.get("/admin/stats"),
  activateUser: (id) => API.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id) => API.patch(`/admin/users/${id}/deactivate`),
  changeRole: (id, role) => API.patch(`/admin/users/${id}/role`, { role }),
  scheduleDelete: (id) => API.delete(`/admin/users/${id}`),
  getLogs: (params) => API.get("/admin/logs", { params }),
  getActivity: () => API.get("/admin/activity"),
  // Locked accounts
  getLockedAccounts: () => API.get("/admin/locked-accounts"),
  unlockUser: (id) => API.patch(`/admin/users/${id}/unlock`),
  // Predictions report
  getAllPredictions: (params) => API.get("/admin/predictions", { params }),
  // Messages admin
  getMessageThreads: () => API.get("/admin/messages/threads"),
  getAdminConversation: (u1, u2) => API.get(`/admin/messages/${u1}/${u2}`),
  deleteAdminMessage: (msgId) => API.delete(`/admin/messages/${msgId}`),
  deleteAdminThread: (u1, u2) =>
    API.delete(`/admin/messages/thread/${u1}/${u2}`),
};

export default API;
