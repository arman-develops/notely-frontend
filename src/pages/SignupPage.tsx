"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/AuthStore"
import { useState } from "react"
import type { SignupData } from "../types/SignupData"
import { validateSignup } from "../utils/validators"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Fade,
  Alert,
} from "@mui/material"
import { Email, LockOutline, Person, Visibility, VisibilityOff } from "@mui/icons-material"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"

interface SignupResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    hasCompletedOnboarding: boolean
    preferences?: string[]
    bio?: string
    avatar?: string
  }
  jwt_token: string
  message?: string
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth, setError, setLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<SignupData>>({})

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData): Promise<SignupResponse> => {
      const response = await axiosInstance.post("/auth/register", data)
      return response.data.data
    },
    onMutate: () => {
      // Set loading state when mutation starts
      setLoading(true)
      clearError()
    },
    onSuccess: (data: SignupResponse) => {
      console.log("Signup successful:", data)

      // Store auth data in Zustand store
      setAuth(data.user, data.jwt_token)

      // Optional: Store token in localStorage for axios interceptors
      localStorage.setItem("auth-token", data.jwt_token)

      // Always navigate to onboarding for new users
      // (hasCompletedOnboarding should be false for new signups)
      navigate("/app/onboarding")
    },
    onError: (error: any) => {
      console.error("Signup error:", error)

      // Handle different types of errors
      let errorMessage = "Signup failed. Please try again."

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors
        if (Array.isArray(backendErrors)) {
          errorMessage = backendErrors.join(", ")
        } else if (typeof backendErrors === "object") {
          // Handle field-specific errors
          const fieldErrors: Partial<SignupData> = {}
          Object.keys(backendErrors).forEach((field) => {
            if (field in formData) {
              fieldErrors[field as keyof SignupData] = backendErrors[field]
            }
          })
          setErrors(fieldErrors)
          errorMessage = "Please fix the errors below."
        }
      } else if (error.response?.status === 409) {
        errorMessage = "Email or username already exists. Please try different credentials."
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your information."
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
    if (!validateSignup({ formData, setErrors })) return

    // Clear any existing errors
    clearError()
    setErrors({})

    // Execute the signup mutation
    signupMutation.mutate(formData)
  }

  const handleChange = (field: keyof SignupData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Fade in timeout={800}>
        <Card
          sx={{
            maxWidth: 480,
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
                Welcome to Notely
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account to start organizing your thoughts
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box display="flex" gap={2} mb={3}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={signupMutation.isPending}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={signupMutation.isPending}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleChange("username")}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 3 }}
                disabled={signupMutation.isPending}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="action.active">@</Typography>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 3 }}
                disabled={signupMutation.isPending}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
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
                sx={{ mb: 4 }}
                disabled={signupMutation.isPending}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutline color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={signupMutation.isPending}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={signupMutation.isPending}
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
                {signupMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      textDecoration: "none",
                      fontWeight: 600,
                      color: "#6366f1",
                      pointerEvents: signupMutation.isPending ? "none" : "auto",
                      opacity: signupMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}
