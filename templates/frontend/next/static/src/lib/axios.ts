import axios from "axios";

const apiClient = axios.create({
  baseURL: "",
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("stockpro_token")
      : null;
  config.headers = config.headers ?? {};
  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
