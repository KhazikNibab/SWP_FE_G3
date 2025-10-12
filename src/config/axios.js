import axios from "axios";

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: 'https://9c08bb20d71a.ngrok-free.app/api/'
});

export default api;