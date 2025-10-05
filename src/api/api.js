import axios from "axios";

const API = axios.create({ baseURL: "https://transaction-book-backend.onrender.com/api" });

API.interceptors.request.use((config) => {
  const raw = localStorage.getItem("tb_user");
  if (raw) {
    const { token } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
