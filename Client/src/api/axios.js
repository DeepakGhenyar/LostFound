import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api"
});

// Add a request interceptor to attach the auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;