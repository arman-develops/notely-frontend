"use client"

import type React from "react"
import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material"
import type { AuthTypes } from "../types/authTypes"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/AuthStore"
import { validateLogin } from "../utils/validators"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"

interface LoginResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    preferences?: string[]
    hasCompletedOnboarding?: boolean
    bio?: string
    avatar?: string
  }
  jwt_token: string
}

export default function LoginPage() {
  const { setAuth, setError, setLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<{ identifier: string; password: string }>({
    identifier: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<AuthTypes>({})

  const loginMutation = useMutation({
    mutationFn: async (data: { identifier: string; password: string }): Promise<LoginResponse> => {
      const response = await axiosInstance.post("/auth/login", data)
      return response.data.data
    },
    onMutate: () => {
      // Set loading state when mutation starts
      setLoading(true)
      clearError()
    },
    onSuccess: (data: LoginResponse) => {
      // console.log("Login successful:", data)

      // Store auth data in Zustand store
      setAuth(data.user, data.jwt_token)

      // Optional: Store token in localStorage for axios interceptors
      localStorage.setItem("auth-token", data.jwt_token)

      // // Navigate based on onboarding status
      if (data.user?.hasCompletedOnboarding) {
        navigate("/app/dashboard")
      } else {
        navigate("/app/onboarding")
      }
      // navigate("/app/dashboard")
    },
    onError: (error: any) => {
      console.error("Login error:", error)

      // Handle different types of errors
      let errorMessage = "Login failed. Please try again."

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email/username or password."
      } else if (error.response?.status === 404) {
        errorMessage = "User not found. Please check your credentials."
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later."
      } else if (error.message === "Network Error") {
        errorMessage = "Network error. Please check your connection."
      }

      setError(errorMessage)
      setLoading(false)
    },
    onSettled: () => {
      // Always set loading to false when mutation completes
      setLoading(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    if (!validateLogin({ formData, setErrors })) return

    // Clear any existing errors
    clearError()

    // Execute the login mutation
    loginMutation.mutate(formData)
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          minWidth: "100vw",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Fade in timeout={800}>
          <Card
            sx={{
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box textAlign="center" mb={4}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to Notely
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email or Username"
                  value={formData.identifier}
                  onChange={handleChange("identifier")}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                  sx={{ mb: 3 }}
                  disabled={loginMutation.isPending}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange("password")}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={{ mb: 2 }}
                  disabled={loginMutation.isPending}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loginMutation.isPending}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box textAlign="right" mb={3}>
                  <Link
                    to="/reset-password"
                    style={{
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      color: "#6366f1",
                      pointerEvents: loginMutation.isPending ? "none" : "auto",
                      opacity: loginMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.5,
                    mb: 3,
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                    },
                    "&:disabled": {
                      background: "rgba(99, 102, 241, 0.5)",
                    },
                  }}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      style={{
                        textDecoration: "none",
                        fontWeight: 600,
                        color: "#6366f1",
                        pointerEvents: loginMutation.isPending ? "none" : "auto",
                        opacity: loginMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      Create one here
                    </Link>
                  </Typography>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </>
  )
}
