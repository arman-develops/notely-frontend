import type React from "react"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Typography, TextField, Button, Paper, Container, Alert, Tabs, Tab, Divider } from "@mui/material"
import { Save, ArrowBack } from "@mui/icons-material"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
    <div role="tabpanel" hidden={value !== index} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

interface FormData {
  title: string
  synopsis: string
  content: string
}

interface FormErrors {
  title?: string
  synopsis?: string
  content?: string
  general?: string
}

export default function NewNotePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addNote } = useNotesStore()

  const [formData, setFormData] = useState<FormData>({
    title: "",
    synopsis: "",
    content: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [tabValue, setTabValue] = useState(0)

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: FormData) => {
      const response = await axiosInstance.post("/entries", noteData)
      return response.data
    },
    onSuccess: (responseData) => {
      // Handle different possible response structures
      const newNote = responseData.data?.newEntry || responseData.data?.entry || responseData.data
      
      if (newNote) {
        // Add to store with proper structure
        const noteToAdd = {
          id: newNote.id,
          title: newNote.title,
          synopsis: newNote.synopsis,
          content: newNote.content,
          dateCreated: newNote.dateCreated || newNote.createdAt || new Date().toISOString(),
          lastUpdated: newNote.lastUpdated || newNote.updatedAt || new Date().toISOString(),
          isDeleted: false,
          isPinned: false,
          isBookmarked: false,
          userId: newNote.userId || newNote.authorID,
        }
        
        addNote(noteToAdd)
        
        // Invalidate and refetch notes to ensure consistency
        queryClient.invalidateQueries({ queryKey: ["notes"] })
        
        // Navigate to the notes page
        navigate("/app/notes")
      } else {
        console.error("Unexpected response structure:", responseData)
        setErrors({ general: "Note created but there was an issue with the response" })
      }
    },
    onError: (error: any) => {
      console.error("Create note error:", error)
      
      // Clear previous errors
      setErrors({})
      
      // Handle different error response structures
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Handle validation errors
        if (errorData.errors) {
          // If errors is an object with field-specific errors
          if (typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
            setErrors(errorData.errors)
          } else {
            // If errors is an array or other format
            setErrors({ general: errorData.message || "Validation failed" })
          }
        } else if (errorData.message) {
          setErrors({ general: errorData.message })
        } else {
          setErrors({ general: "Failed to create note" })
        }
      } else if (error.message) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: "Network error. Please check your connection and try again." })
      }
    },
  })

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    // Synopsis validation
    if (!formData.synopsis.trim()) {
      newErrors.synopsis = "Synopsis is required"
    } else if (formData.synopsis.trim().length < 10) {
      newErrors.synopsis = "Synopsis must be at least 10 characters long"
    } else if (formData.synopsis.length > 300) {
      newErrors.synopsis = "Synopsis must be less than 300 characters"
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    } else if (formData.content.trim().length < 20) {
      newErrors.content = "Content must be at least 20 characters long"
    } else if (formData.content.length > 50000) {
      newErrors.content = "Content must be less than 50,000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear general error
    setErrors(prev => ({ ...prev, general: undefined }))
    
    if (!validateForm()) return

    // Trim whitespace from form data before submission
    const trimmedData = {
      title: formData.title.trim(),
      synopsis: formData.synopsis.trim(),
      content: formData.content.trim(),
    }

    createNoteMutation.mutate(trimmedData)
  }

  const handleChange = useCallback((field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleCancel = () => {
    // Check if there's unsaved data
    const hasUnsavedData = formData.title.trim() || formData.synopsis.trim() || formData.content.trim()
    
    if (hasUnsavedData) {
      const shouldLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?")
      if (!shouldLeave) return
    }
    
    navigate("/app/notes")
  }

  // Character count helpers
  const getTitleCharCount = () => formData.title.length
  const getSynopsisCharCount = () => formData.synopsis.length
  const getContentCharCount = () => formData.content.length

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={handleCancel} 
          sx={{ mb: 2 }}
          disabled={createNoteMutation.isPending}
        >
          Back to Notes
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create New Entry
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Write your thoughts, ideas, and insights
        </Typography>
      </Box>

      {/* General error alert */}
      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors(prev => ({ ...prev, general: undefined }))}>
          {errors.general}
        </Alert>
      )}

      {/* Network/mutation error alert */}
      {createNoteMutation.error && !errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(createNoteMutation.error as any)?.response?.data?.message || 
           (createNoteMutation.error as any)?.message || 
           "Failed to create note. Please try again."}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={handleChange("title")}
            error={!!errors.title}
            helperText={errors.title || `${getTitleCharCount()}/100 characters`}
            sx={{ mb: 3 }}
            slotProps={{
              htmlInput: {
                maxLength: 100 
              }
            }}
            disabled={createNoteMutation.isPending}
            required
          />

          <TextField
            fullWidth
            label="Synopsis"
            multiline
            rows={3}
            value={formData.synopsis}
            onChange={handleChange("synopsis")}
            error={!!errors.synopsis}
            helperText={errors.synopsis || `A brief summary of your entry (${getSynopsisCharCount()}/300 characters)`}
            sx={{ mb: 3 }}
            slotProps={{
              htmlInput: {
                maxLength: 300
              }
            }}
            disabled={createNoteMutation.isPending}
            required
          />

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="Content editing tabs">
              <Tab label="Write" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Preview" id="tab-1" aria-controls="tabpanel-1" />
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
              helperText={errors.content || `Write your content in Markdown format (${getContentCharCount()} characters)`}
              disabled={createNoteMutation.isPending}
              required
              placeholder="# Your Note Title

Write your content here using **Markdown** formatting...

- You can create lists
- Add **bold** and *italic* text
- Include [links](https://example.com)
- And much more!"
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }
              }}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box
              sx={{
                minHeight: 400,
                maxHeight: 600,
                overflow: 'auto',
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              {formData.content.trim() ? (
                <ReactMarkdown
                  components={{
                    // Custom components for better styling
                    h1: ({ children }) => <Typography variant="h4" component="h1" gutterBottom>{children}</Typography>,
                    h2: ({ children }) => <Typography variant="h5" component="h2" gutterBottom>{children}</Typography>,
                    h3: ({ children }) => <Typography variant="h6" component="h3" gutterBottom>{children}</Typography>,
                    p: ({ children }) => <Typography variant="body1" paragraph>{children}</Typography>,
                  }}
                >
                  {formData.content}
                </ReactMarkdown>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  Start writing in the "Write" tab to see the preview...
                </Typography>
              )}
            </Box>
          </TabPanel>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={handleCancel} 
              disabled={createNoteMutation.isPending}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={createNoteMutation.isPending || !formData.title.trim() || !formData.synopsis.trim() || !formData.content.trim()}
              size="large"
              sx={{
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                }
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