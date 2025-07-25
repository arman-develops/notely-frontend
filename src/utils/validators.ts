import type { AuthTypes } from "../types/authTypes"
import type { SignupData } from "../types/SignupData"
interface ValidateLoginProps {
  formData: {
    identifier: string
    password: string
  }
  setErrors: (errors: AuthTypes) => void
}

interface ValidateSignupProps {
  formData: SignupData
  setErrors: (errors: Partial<SignupData>) => void
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

export const validateSignup = ({ formData, setErrors }: ValidateSignupProps): boolean => {
  const errors: Partial<SignupData> = {}

  // Validate first name
  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required"
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters"
  } else if (formData.firstName.trim().length > 50) {
    errors.firstName = "First name must be less than 50 characters"
  } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
    errors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes"
  }

  // Validate last name
  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required"
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters"
  } else if (formData.lastName.trim().length > 50) {
    errors.lastName = "Last name must be less than 50 characters"
  } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
    errors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes"
  }

  // Validate username
  if (!formData.username.trim()) {
    errors.username = "Username is required"
  } else if (formData.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters"
  } else if (formData.username.trim().length > 30) {
    errors.username = "Username must be less than 30 characters"
  } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
    errors.username = "Username can only contain letters, numbers, underscores, dots, and hyphens"
  } else if (/^[._-]/.test(formData.username.trim()) || /[._-]$/.test(formData.username.trim())) {
    errors.username = "Username cannot start or end with special characters"
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = "Email is required"
  } else if (!validateEmail(formData.email.trim())) {
    errors.email = "Please enter a valid email address"
  } else if (formData.email.trim().length > 254) {
    errors.email = "Email address is too long"
  }

  // Validate password
  if (!formData.password) {
    errors.password = "Password is required"
  } else {
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message
    }
  }

  setErrors(errors)
  return Object.keys(errors).length === 0
}