import axios from 'axios'

/**
 * API Service Layer
 * 
 * Centralized configuration for all outgoing HTTP requests.
 * Features:
 * 1. Automatic JWT injection from LocalStorage.
 * 2. Unified BaseURL management for easy deployment switching.
 * 3. Error interceptor hooks (placeholder for global error handling).
 */
const API = axios.create({
  baseURL: 'http://localhost:5223/api',
})

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
