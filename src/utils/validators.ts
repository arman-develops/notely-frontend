import type { AuthTypes } from "../types/authTypes"
import type { SignupData } from "../types/SignupData"

export const validateSignup = ({formData, setErrors}:any): boolean => {
    const newErrors: Partial<SignupData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.email.trim()) {
        newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
        newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
}
interface ValidateLoginProps {
  formData: {
    identifier: string
    password: string
  }
  setErrors: (errors: AuthTypes) => void
}

export const validateLogin = ({ formData, setErrors }: ValidateLoginProps): boolean => {
  const errors: AuthTypes = {}

  // Validate identifier (email or username)
  if (!formData.identifier.trim()) {
    errors.identifier = "Email or username is required"
  } else if (formData.identifier.trim().length < 3) {
    errors.identifier = "Email or username must be at least 3 characters"
  }

  // Validate password
  if (!formData.password) {
    errors.password = "Password is required"
  } else if (formData.password.length < 3) {
    errors.password = "Password must be at least 6 characters"
  }

  setErrors(errors)
  return Object.keys(errors).length === 0
}

// Additional validators for other forms
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }

  return { isValid: true }
}