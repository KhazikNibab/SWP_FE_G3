import axios from "axios";

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://3dc8a7721034.ngrok-free.app/api'
});

export default api;