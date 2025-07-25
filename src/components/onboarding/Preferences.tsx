import { Box, Typography, Button, Chip, Grid } from "@mui/material"
import {
  Flight,
  Computer,
  Restaurant,
  FitnessCenter,
  Book,
  Palette,
  Business,
  School,
  Home,
  Favorite,
  MusicNote,
  Camera,
} from "@mui/icons-material"

const preferenceOptions = [
  { id: "travel", label: "Travel", icon: Flight, color: "#3b82f6" },
  { id: "tech", label: "Technology", icon: Computer, color: "#8b5cf6" },
  { id: "food", label: "Food & Cooking", icon: Restaurant, color: "#f59e0b" },
  { id: "fitness", label: "Health & Fitness", icon: FitnessCenter, color: "#10b981" },
  { id: "books", label: "Books & Reading", icon: Book, color: "#ef4444" },
  { id: "art", label: "Art & Design", icon: Palette, color: "#f97316" },
  { id: "business", label: "Business", icon: Business, color: "#6366f1" },
  { id: "education", label: "Education", icon: School, color: "#8b5cf6" },
  { id: "lifestyle", label: "Lifestyle", icon: Home, color: "#ec4899" },
  { id: "personal", label: "Personal", icon: Favorite, color: "#ef4444" },
  { id: "music", label: "Music", icon: MusicNote, color: "#8b5cf6" },
  { id: "photography", label: "Photography", icon: Camera, color: "#6366f1" },
]

type PreferencesStepProps = {
  preferences: string[]
  onPreferencesChange: (preferences: string[]) => void
  onNext: () => void
  onBack: () => void
}

export default function PreferencesStep({ preferences, onPreferencesChange, onNext, onBack }: PreferencesStepProps) {
  const handleTogglePreference = (preferenceId: string) => {
    if (preferences.includes(preferenceId)) {
      onPreferencesChange(preferences.filter((p) => p !== preferenceId))
    } else {
      onPreferencesChange([...preferences, preferenceId])
    }
  }

  return (
    <Box py={2}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
          What interests you?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select topics you'd like to write about. This helps us organize your notes better.
        </Typography>
      </Box>

      <Grid container spacing={2} mb={4}>
        {preferenceOptions.map((option) => {
          const IconComponent = option.icon
          const isSelected = preferences.includes(option.id)

          return (
            <Grid size={{xs:6, sm:4}} key={option.id}>
              <Chip
                icon={<IconComponent />}
                label={option.label}
                onClick={() => handleTogglePreference(option.id)}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  width: "100%",
                  height: 48,
                  fontSize: "0.875rem",
                  backgroundColor: isSelected ? option.color : "transparent",
                  color: isSelected ? "white" : option.color,
                  borderColor: option.color,
                  "&:hover": {
                    backgroundColor: isSelected ? option.color : `${option.color}20`,
                  },
                }}
              />
            </Grid>
          )
        })}
      </Grid>

      <Box textAlign="center" mb={3}>
        <Typography variant="body2" color="text.secondary">
          Selected: {preferences.length} {preferences.length === 1 ? "topic" : "topics"}
        </Typography>
      </Box>

      <Box display="flex" gap={2} justifyContent="space-between">
        <Button variant="outlined" onClick={onBack} sx={{ px: 3 }}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={preferences.length === 0}
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
