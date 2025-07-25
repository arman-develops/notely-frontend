import { useState } from "react"
import { Box, Typography, TextField, Button, Paper, Chip } from "@mui/material"
import { Create, CheckCircle } from "@mui/icons-material"

type FirstNoteStepProps = {
  onNext: () => void
  onBack: () => void
}

export default function FirstNoteStep({ onNext, onBack }: FirstNoteStepProps) {
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const categories = ["Personal", "Ideas", "Goals", "Thoughts", "Inspiration"]

  const handleComplete = () => {
    // In a real app, you'd save the note here
    onNext()
  }

  return (
    <Box py={2}>
      <Box textAlign="center" mb={4}>
        <Create
          sx={{
            fontSize: 60,
            color: "#6366f1",
            mb: 2,
          }}
        />
        <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
          Write Your First Note
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's start your journey with your very first note in Notely!
        </Typography>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          border: "2px dashed",
          borderColor: "primary.light",
          backgroundColor: "primary.50",
        }}
      >
        <TextField
          fullWidth
          label="Note Title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="My first note..."
          sx={{ mb: 3 }}
        />

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose a category:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "filled" : "outlined"}
                color={selectedCategory === category ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Your thoughts..."
          multiline
          rows={6}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Welcome to my digital notebook! Today I'm starting my journey with Notely..."
        />
      </Paper>

      <Box textAlign="center" mb={3}>
        <Typography variant="body2" color="text.secondary">
          Don't worry, you can always edit or delete this note later!
        </Typography>
      </Box>

      <Box display="flex" gap={2} justifyContent="space-between">
        <Button variant="outlined" onClick={onBack} sx={{ px: 3 }}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={!noteTitle.trim() || !noteContent.trim()}
          startIcon={<CheckCircle />}
          sx={{
            px: 3,
            background: "linear-gradient(45deg, #10b981, #059669)",
            "&:hover": {
              background: "linear-gradient(45deg, #059669, #047857)",
            },
          }}
        >
          Complete Setup
        </Button>
      </Box>
    </Box>
  )
}
