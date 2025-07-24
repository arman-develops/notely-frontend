import React, { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Divider, Fade, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Email, LockClockOutlined, Visibility, VisibilityOff } from '@mui/icons-material'
import type { AuthTypes } from "../types/authTypes";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

export default function LoginPage() {
    const { isLoading, error, clearError } = useAuthStore()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<AuthTypes>({})
    
    const validateForm = (): Boolean => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if(!validateForm()) return

        //clear error here
        //simulate login here
        if(!error) {
            navigate("/app/dashboard")
        }
    }

    const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({...prev, [field]: e.target.value}))
        if(errors[field]) {
            setErrors((prev:any) => ({...prev, [field]: undefined}))
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
                    p: 2
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
                        <CardContent sx={{p: 4}}>
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
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email color="action" />
                                                </InputAdornment>
                                            ),
                                        }
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
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockClockOutlined color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                /> 

                                <Box textAlign="right" mb={3}>
                                    <Link to="/reset-password"
                                        style={{
                                            textDecoration: "none",
                                            fontSize: "0.875rem",
                                            color: "#6366f1"
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
                                    disabled={isLoading}
                                    sx={{
                                        py: 1.5,
                                        mb: 3,
                                        background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                                        "&:hover": {
                                            background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                                        },
                                    }}
                                >
                                    {isLoading ? "Signing In...": "Sign In"}
                                </Button>

                                <Divider sx={{ mb: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        or
                                    </Typography>
                                </Divider>

                                <Box textAlign="center">
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{" "}
                                    <Link to="/signup" style={{ textDecoration: "none", fontWeight: 600, color: "#6366f1" }}>
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