import axios from "axios";

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://bb5db6e43d7d.ngrok-free.app/api'
});

export default api;