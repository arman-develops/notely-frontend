import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  useTheme,
  CircularProgress,
} from "@mui/material"
import {
  ArrowBack,
  PhotoCamera,
  Edit,
  Save,
  Cancel,
  Person,
  Security,
  Notifications,
  Storage,
  TrendingUp,
  CalendarToday,
  Description,
  Star,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material"
import { useAuthStore } from "../store/AuthStore"
import { useNotesStore } from "../store/NotesStore"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { format } from "date-fns"
import axios from "axios"
import { CLOUDINARY_URL, UPLOAD_PRESET } from "../service/Cloudinary"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export default function ProfilePage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, updateUser, setError, error, clearError } = useAuthStore()
  const { notes } = useNotesStore()

  const [tabValue, setTabValue] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    autoSave: true,
    publicProfile: false,
  })

  const [profileErrors, setProfileErrors] = useState<any>({})
  const [passwordErrors, setPasswordErrors] = useState<any>({})

  // Calculate user stats
  const userStats = {
    totalNotes: notes.filter((note) => !note.isDeleted).length,
    pinnedNotes: notes.filter((note) => !note.isDeleted && note.isPinned).length,
    bookmarkedNotes: notes.filter((note) => !note.isDeleted && note.isBookMarked).length,
    joinDate: user?.dateJoined ? format(new Date(user.dateJoined), "MMMM yyyy") : "Unknown",
    lastActive: "Today", // This would come from your backend
  }

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const response = await axiosInstance.patch("/user", data)
      return response.data.data.updatedUser
    },
    onSuccess: (data) => {
      updateUser(data)
      setIsEditing(false)
      clearError()
    },
    onError: (error: any) => {
      // console.log(error)
      if (error.response?.data?.errors) {
        setProfileErrors(error.response.data.errors)
      } else {
        setError(error.response?.data?.message || "Failed to update profile")
      }
    },
  })

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const response = await axiosInstance.post("/auth/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      return response.data.data.updatedUser
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setPasswordErrors({})
      // Show success message
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors)
      } else {
        setError(error.response?.data?.message || "Failed to update password")
      }
    },
  })

  // Avatar upload mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarURL: string) => {
      const response = await axiosInstance.patch("/user", { avatar: avatarURL })
      return response.data.data.updatedUser
    },
    onSuccess: (data) => {
      updateUser({ avatar: data.avatar || data.avatarUrl })
      clearError()
    },
    onError: (error: any) => {
      console.log(error)
      setError(error.response?.data?.message || "Failed to update avatar")
    },
  })

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors: any = {}
    if (!profileForm.firstName.trim()) errors.firstName = "First name is required"
    if (!profileForm.lastName.trim()) errors.lastName = "Last name is required"
    if (!profileForm.username.trim()) errors.username = "Username is required"
    if (!profileForm.email.trim()) errors.email = "Email is required"

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    updateProfileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password form
    const errors: any = {}
    if (!passwordForm.currentPassword) errors.currentPassword = "Current password is required"
    if (!passwordForm.newPassword) errors.newPassword = "New password is required"
    if (passwordForm.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters"
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    updatePasswordMutation.mutate(passwordForm)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    clearError()

    const formDataUpload = new FormData()
    formDataUpload.append("file", file)
    formDataUpload.append("upload_preset", UPLOAD_PRESET)

    try {
      // Upload to Cloudinary
      const cloudinaryResponse = await axios.post(CLOUDINARY_URL, formDataUpload)
      const imageURL = cloudinaryResponse.data.secure_url
      
      console.log("Image uploaded to Cloudinary:", imageURL)
      
      // Update avatar in backend
      updateAvatarMutation.mutate(imageURL)
      
    } catch (err: any) {
      console.error("Upload failed", err)
      
      let errorMessage = "Failed to upload avatar. Please try again."
      
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid file format. Please choose a valid image."
      } else if (err.message === "Network Error") {
        errorMessage = "Network error. Please check your connection."
      }
      
      setError(errorMessage)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/dashboard")} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Overview Card */}
        <Grid size={{xs:12, md:4}}>
          <Card sx={{ borderRadius: 1.5, boxShadow: theme.shadows[4] }}>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Box position="relative" display="inline-block" mb={3}>
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    fontSize: "2rem",
                    fontWeight: 600,
                  }}
                >
                  {!user?.avatar && getInitials(user?.firstName, user?.lastName)}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar || updateAvatarMutation.isPending}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                    disabled={isUploadingAvatar || updateAvatarMutation.isPending}
                  >
                    {(isUploadingAvatar || updateAvatarMutation.isPending) ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PhotoCamera />
                    )}
                  </IconButton>
                </label>
              </Box>

              <Typography variant="h5" fontWeight={600} gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                @{user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {user?.bio || "No bio added yet"}
              </Typography>

              <Box display="flex" justifyContent="center" gap={1} mb={3}>
                {user?.preferences?.map((pref) => (
                  <Chip key={pref} label={pref} size="small" color="primary" variant="outlined" />
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* User Stats */}
              <Grid container spacing={2}>
                <Grid size={{xs:6}}>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {userStats.totalNotes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notes
                  </Typography>
                </Grid>
                <Grid size={{xs:6}}>
                  <Typography variant="h6" fontWeight={600} color="secondary.main">
                    {userStats.pinnedNotes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pinned
                  </Typography>
                </Grid>
                <Grid size={{xs:6}}>
                  <Typography variant="h6" fontWeight={600} color="info.main">
                    {userStats.bookmarkedNotes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bookmarked
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Tabs */}
        <Grid size={{xs:12, md:8}}>
          <Card sx={{ borderRadius: 1.5, boxShadow: theme.shadows[4] }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab icon={<Person />} label="Profile" />
                <Tab icon={<Security />} label="Security" />
                <Tab icon={<Notifications />} label="Notifications" />
                <Tab icon={<TrendingUp />} label="Activity" />
              </Tabs>
            </Box>

            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Typography variant="h6" fontWeight={600}>
                    Personal Information
                  </Typography>
                  {!isEditing ? (
                    <Button startIcon={<Edit />} onClick={() => setIsEditing(true)} sx={{ textTransform: "none" }}>
                      Edit Profile
                    </Button>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => {
                          setIsEditing(false)
                          setProfileForm({
                            firstName: user?.firstName || "",
                            lastName: user?.lastName || "",
                            username: user?.username || "",
                            email: user?.email || "",
                            bio: user?.bio || "",
                          })
                          setProfileErrors({})
                        }}
                        sx={{ textTransform: "none" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleProfileSubmit}
                        disabled={updateProfileMutation.isPending}
                        sx={{
                          textTransform: "none",
                          background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                          },
                        }}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </Box>
                  )}
                </Box>

                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        disabled={!isEditing}
                        error={!!profileErrors.firstName}
                        helperText={profileErrors.firstName}
                      />
                    </Grid>
                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        disabled={!isEditing}
                        error={!!profileErrors.lastName}
                        helperText={profileErrors.lastName}
                      />
                    </Grid>
                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        disabled={!isEditing}
                        error={!!profileErrors.username}
                        helperText={profileErrors.username}
                        slotProps={{
                          input: {
                            startAdornment: <Typography color="text.secondary">@</Typography>,
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{xs:12, sm:6}}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        disabled={!isEditing}
                        error={!!profileErrors.email}
                        helperText={profileErrors.email}
                      />
                    </Grid>
                    <Grid size={{xs:12}}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        slotProps={{ htmlInput:{ maxLength: 500 }}}
                      />
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={1}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={600} mb={4}>
                  Change Password
                </Typography>

                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{xs:12}}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword}
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{xs: 12}}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword || "Password must be at least 8 characters"}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }
                        }}
                      />
                    </Grid>
                    <Grid size={{xs:12}}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword}
                        slotProps={{
                          input: {
                            endAdornment: (
                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            ),
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{xs:12}}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updatePasswordMutation.isPending}
                        sx={{
                          background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                          },
                        }}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={2}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={600} mb={4}>
                  Notification Preferences
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive updates about your notes and account via email"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Get notified about important updates in real-time"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.pushNotifications}
                          onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Save />
                    </ListItemIcon>
                    <ListItemText primary="Auto Save" secondary="Automatically save your notes as you type" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoSave}
                          onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary="Public Profile" secondary="Make your profile visible to other users" />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.publicProfile}
                          onChange={(e) => setSettings({ ...settings, publicProfile: e.target.checked })}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </TabPanel>

            {/* Activity Tab */}
            <TabPanel value={tabValue} index={3}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={600} mb={4}>
                  Account Activity
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{xs:12, sm:6}}>
                    <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                      <CalendarToday sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Member Since
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userStats.joinDate}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{xs:12, sm:6}}>
                    <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                      <Description sx={{ fontSize: 40, color: "success.main", mb: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Total Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userStats.totalNotes} notes created
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{xs:12, sm:6}}>
                    <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                      <Star sx={{ fontSize: 40, color: "warning.main", mb: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Pinned Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userStats.pinnedNotes} important notes
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{xs:12, sm:6}}>
                    <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                      <Storage sx={{ fontSize: 40, color: "info.main", mb: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Last Active
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userStats.lastActive}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}