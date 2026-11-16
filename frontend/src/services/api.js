import axios from "axios";

const api = axios.create({
  baseURL: "", // same origin: the backend serves this app
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("roommatch_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
