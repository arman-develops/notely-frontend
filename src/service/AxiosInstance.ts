import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "http://localhost:3500/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem("auth-token")
      // Redirect to login page
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
