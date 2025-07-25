import type React from "react"
import { useState } from "react"
import { Box, Typography, TextField, Button, Avatar, IconButton, Alert } from "@mui/material"
import { PhotoCamera, Person, CloudUpload } from "@mui/icons-material"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../../service/AxiosInstance"

interface ProfileData {
  bio: string
  avatar: string
}

interface ProfileStepProps {
  profileData: ProfileData
  onProfileChange: (data: ProfileData) => void
  onNext: () => void
  onBack: () => void
}

interface UploadResponse {
  url: string
  message?: string
}

export default function ProfileStep({ profileData, onProfileChange, onNext, onBack }: ProfileStepProps) {
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await axiosInstance.post("/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: (data: UploadResponse) => {
      console.log("Avatar uploaded:", data)
      onProfileChange({ ...profileData, avatar: data.url })
      setUploadError(null)
    },
    onError: (error: any) => {
      console.error("Avatar upload error:", error)

      let errorMessage = "Failed to upload avatar. Please try again."

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 413) {
        errorMessage = "File too large. Please choose a smaller image."
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid file format. Please choose a valid image."
      }

      setUploadError(errorMessage)
    },
  })

  const handleChange = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onProfileChange({ ...profileData, [field]: e.target.value })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB.")
      return
    }

    uploadMutation.mutate(file)
  }

  return (
    <Box py={2}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
          Set Up Your Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tell us a bit about yourself to personalize your experience
        </Typography>
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Box position="relative" mb={2}>
          <Avatar
            src={profileData.avatar}
            sx={{
              width: 100,
              height: 100,
              background: profileData.avatar ? "transparent" : "linear-gradient(45deg, #6366f1, #8b5cf6)",
            }}
          >
            {!profileData.avatar && <Person sx={{ fontSize: 50 }} />}
          </Avatar>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
            disabled={uploadMutation.isPending}
          />
          <label htmlFor="avatar-upload">
            <IconButton
              component="span"
              disabled={uploadMutation.isPending}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "background.paper",
                boxShadow: 2,
                "&:hover": {
                  backgroundColor: "background.paper",
                },
              }}
            >
              {uploadMutation.isPending ? <CloudUpload /> : <PhotoCamera />}
            </IconButton>
          </label>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {uploadMutation.isPending ? "Uploading..." : "Upload a profile picture (optional)"}
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Tell us about yourself"
        multiline
        rows={4}
        value={profileData.bio}
        onChange={handleChange("bio")}
        placeholder="I'm passionate about... I love to write about... My interests include..."
        sx={{ mb: 4 }}
        helperText="This helps us suggest relevant note categories and features"
        inputProps={{ maxLength: 500 }}
      />

      <Box display="flex" gap={2} justifyContent="space-between">
        <Button variant="outlined" onClick={onBack} sx={{ px: 3 }}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          sx={{
            px: 3,
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            "&:hover": {
              background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
            },
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  )
}
