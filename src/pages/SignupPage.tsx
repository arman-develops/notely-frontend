import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useState } from "react";
import type { SignupData } from "../types/SignupData";
import { validateSignup } from "../utils/validators";
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
import { Email, LockOutline, Person, Visibility, VisibilityOff } from "@mui/icons-material";

export default function SignupPage() {
    const navigate = useNavigate()

    const {signup, isLoading, error, clearError} = useAuthStore()

    const [formData, setFormData] = useState<SignupData>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Partial<SignupData>>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateSignup({formData, setErrors})) return

        clearError()
        await signup(formData)

        // If signup successful, navigate to onboarding
        if (!error) {
            navigate("/onboarding")
        }
    }

    const handleChange = (field: keyof SignupData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
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
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleChange("lastName")}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }
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
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography color="action.active">@</Typography>
                                </InputAdornment>
                            ),
                        }
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
                        sx={{ mb: 4 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutline color="action" />
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
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
    
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{" "}
                            <Link to="/login" style={{ textDecoration: "none", fontWeight: 600, color: "#6366f1" }}>
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