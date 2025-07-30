import type React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import { Create, CheckCircle } from "@mui/icons-material";
import { useAuthStore } from "../../store/AuthStore";

interface NoteData {
  title: string;
  content: string;
  synopsis: string;
  category: string;
}

interface FirstNoteStepProps {
  noteData: NoteData;
  onNoteChange: (data: NoteData) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function FirstNoteStep({
  noteData,
  onNoteChange,
  onNext,
  onBack,
  isLoading,
}: FirstNoteStepProps) {
  const { error } = useAuthStore();

  const categories = [
    "Personal",
    "Ideas",
    "Goals",
    "Thoughts",
    "Inspiration",
    "Work",
    "Learning",
  ];

  const handleChange =
    (field: keyof NoteData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onNoteChange({ ...noteData, [field]: e.target.value });
    };

  const handleCategorySelect = (category: string) => {
    onNoteChange({ ...noteData, category });
  };

  const handleComplete = () => {
    onNext();
  };

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
          value={noteData.title}
          onChange={handleChange("title")}
          placeholder="My first note..."
          sx={{ mb: 3 }}
          disabled={isLoading}
          inputProps={{ maxLength: 100 }}
        />

        <TextField
          fullWidth
          label="A brief summary..."
          multiline
          rows={6}
          value={noteData.synopsis}
          onChange={handleChange("synopsis")}
          placeholder="Welcome to my digital notebook!..."
          disabled={isLoading}
          inputProps={{ maxLength: 2000 }}
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
                onClick={() => handleCategorySelect(category)}
                variant={noteData.category === category ? "filled" : "outlined"}
                color={noteData.category === category ? "primary" : "default"}
                disabled={isLoading}
              />
            ))}
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Your thoughts..."
          multiline
          rows={6}
          value={noteData.content}
          onChange={handleChange("content")}
          placeholder="Today I'm starting my journey with Notely..."
          disabled={isLoading}
          slotProps={{ htmlInput: { maxLength: 2000 } }}
        />
      </Paper>

      <Box textAlign="center" mb={3}>
        <Typography variant="body2" color="text.secondary">
          {noteData.title || noteData.content
            ? "Your first note will be saved automatically!"
            : "Don't worry, you can skip this step and create notes later."}
        </Typography>
      </Box>

      <Box display="flex" gap={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ px: 3 }}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          startIcon={<CheckCircle />}
          disabled={isLoading}
          sx={{
            px: 3,
            background: "linear-gradient(45deg, #10b981, #059669)",
            "&:hover": {
              background: "linear-gradient(45deg, #059669, #047857)",
            },
            "&:disabled": {
              background: "rgba(16, 185, 129, 0.5)",
            },
          }}
        >
          {isLoading ? "Completing Setup..." : "Complete Setup"}
        </Button>
      </Box>
    </Box>
  );
}
