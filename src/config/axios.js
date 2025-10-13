import axios from "axios";

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://c0e90a9c6ce5.ngrok-free.app/api'
});

export default api;