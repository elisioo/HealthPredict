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
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (data) => API.post("/auth/reset-password", data),
  deleteAccount: (password) =>
    API.delete("/auth/account", { data: { password } }),
};

export const messageApi = {
  getInbox: () => API.get("/messages/inbox"),
  getStaffList: () => API.get("/messages/staff"),
  getUnreadCount: () => API.get("/messages/unread"),
  getConversation: (userId) => API.get(`/messages/${userId}`),
  sendMessage: (data) => API.post("/messages", data),
};

export const predictionApi = {
  predict: (data) => API.post("/predictions/predict", data),
  getHistory: () => API.get("/predictions/history"),
};

export const profileApi = {
  getHealthProfile: () => API.get("/profile/health"),
  updateHealthProfile: (data) => API.put("/profile/health", data),
  updatePhone: (phone) => API.patch("/profile/phone", { phone }),
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

export const staffApi = {
  getDashboard: () => API.get("/staff/dashboard"),
  getPatients: (params) => API.get("/staff/patients", { params }),
  addPatient: (data) => API.post("/staff/patients", data),
  // Teams
  getMyTeam: () => API.get("/staff/teams/my"),
  getTeams: () => API.get("/staff/teams"),
  getTeam: (id) => API.get(`/staff/teams/${id}`),
  createTeam: (data) => API.post("/staff/teams", data),
  updateTeam: (id, data) => API.put(`/staff/teams/${id}`, data),
  deleteTeam: (id) => API.delete(`/staff/teams/${id}`),
  getUnassignedStaff: () => API.get("/staff/teams/unassigned"),
};

export default API;
