import type React from "react"

import { Box, Typography, TextField, Button, Avatar, IconButton } from "@mui/material"
import { PhotoCamera, Person } from "@mui/icons-material"

type ProfileData = {
  bio: string
  avatar: string
}

type ProfileStepProps = {
  profileData: ProfileData
  onProfileChange: (data: ProfileData) => void
  onNext: () => void
  onBack: () => void
}

export default function ProfileStep({ profileData, onProfileChange, onNext, onBack }: ProfileStepProps) {
  const handleChange = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onProfileChange({ ...profileData, [field]: e.target.value })
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

      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Box position="relative" mb={2}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            }}
          >
            <Person sx={{ fontSize: 50 }} />
          </Avatar>
          <IconButton
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
            <PhotoCamera />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Upload a profile picture (optional)
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
