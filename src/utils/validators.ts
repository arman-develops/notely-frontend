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

export const validateLogin = ({formData, setErrors}:any): Boolean => {
        const newErrors:AuthTypes = {}
        
        if(!formData.identifier.trim()) {
            newErrors.identifier = "Email or username is required"
        }
        if(!formData.password) {
            newErrors.password = "Password is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }