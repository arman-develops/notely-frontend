import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Typography, TextField, Button, Paper, Container, Alert, Tabs, Tab, Divider } from "@mui/material"
import { Save, ArrowBack } from "@mui/icons-material"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { useNotesStore } from "../store/NotesStore"
import ReactMarkdown from "react-markdown"

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

export default function NewNotePage() {
  const navigate = useNavigate()
  const { addNote } = useNotesStore()

  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    content: "",
  })
  const [errors, setErrors] = useState<{ title?: string; synopsis?: string; content?: string }>({})
  const [tabValue, setTabValue] = useState(0)

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: typeof formData) => {
      const response = await axiosInstance.post("/notes", noteData)
      return response.data
    },
    onSuccess: (data) => {
      addNote({
        ...data.note,
        isDeleted: false,
        isPinned: false,
        isBookmarked: false,
        userId: data.note.userId,
      })
      navigate("/app/notes")
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    },
  })

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = "Synopsis is required"
    } else if (formData.synopsis.length > 300) {
      newErrors.synopsis = "Synopsis must be less than 300 characters"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    createNoteMutation.mutate(formData)
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/notes")} sx={{ mb: 2 }}>
          Back to Notes
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create New Entry
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Write your thoughts, ideas, and insights
        </Typography>
      </Box>

      {createNoteMutation.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(createNoteMutation.error as any)?.response?.data?.message || "Failed to create note"}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title}
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 100 }}
            disabled={createNoteMutation.isPending}
          />

          <TextField
            fullWidth
            label="Synopsis"
            multiline
            rows={3}
            value={formData.synopsis}
            onChange={handleChange("synopsis")}
            error={!!errors.synopsis}
            helperText={errors.synopsis || "A brief summary of your entry"}
            sx={{ mb: 3 }}
            inputProps={{ maxLength: 300 }}
            disabled={createNoteMutation.isPending}
          />

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Write" />
              <Tab label="Preview" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={15}
              value={formData.content}
              onChange={handleChange("content")}
              error={!!errors.content}
              helperText={errors.content || "Write your content in Markdown format"}
              disabled={createNoteMutation.isPending}
              placeholder="# Your Note Title

Write your content here using **Markdown** formatting...

- You can create lists
- Add **bold** and *italic* text
- Include [links](https://example.com)
- And much more!"
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box
              sx={{
                minHeight: 400,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              {formData.content ? (
                <ReactMarkdown>{formData.content}</ReactMarkdown>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  Start writing to see the preview...
                </Typography>
              )}
            </Box>
          </TabPanel>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate("/app/notes")} disabled={createNoteMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={createNoteMutation.isPending}
              sx={{
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                },
              }}
            >
              {createNoteMutation.isPending ? "Creating..." : "Create Entry"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  )
}
