import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Container,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material"
import {
  ArrowBack,
  Save,
  Cancel,
  PushPin,
  Bookmark,
  Delete,
  Visibility,
  Edit,
  AccessTime,
  CalendarToday,
} from "@mui/icons-material"
import { useNotesStore } from "../store/NotesStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { formatDistanceToNow, format } from "date-fns"
import { showToast } from "../utils/toast"

interface EditNoteFormData {
  title: string
  synopsis: string
  content: string
}

export default function EditNotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { updateNote, togglePin, toggleBookmark, deleteNote, setError, error, clearError } = useNotesStore()

  const [formData, setFormData] = useState<EditNoteFormData>({
    title: "",
    synopsis: "",
    content: "",
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<EditNoteFormData>({
    title: "",
    synopsis: "",
    content: "",
  })

  // Fetch note data
  const { data: noteData, isLoading, error: queryError } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/entry/${id}`)
      return response.data.data.entry
    },
    enabled: !!id,
  })

  // Initialize form data when note data is loaded
  useEffect(() => {
    if (noteData) {
      const initialData = {
        title: noteData.noteTitle || "",
        synopsis: noteData.synopsis || "",
        content: noteData.content || "",
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setHasChanges(false) // Reset changes when data loads
      clearError() // Clear any existing errors
    }
  }, [noteData, clearError])

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditNoteFormData) => {
      const response = await axiosInstance.patch(`/entry/${id}`, data)
      // console.log(response.data.data.updatedEntry)
      return response.data.data.updatedEntry
    },
    onSuccess: (updatedNote) => {
      updateNote(id!, {
        title: updatedNote.noteTitle,
        synopsis: updatedNote.synopsis,
        content: updatedNote.content,
        lastUpdated: updatedNote.lastUpdated,
      })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["note", id] })
      
      // Update original data to reflect saved state
      const newData = {
        title: updatedNote.noteTitle,
        synopsis: updatedNote.synopsis,
        content: updatedNote.content,
      }
      setOriginalData(newData)
      setHasChanges(false)
      showToast.success("Note updated successfully!")
      clearError()
    },
    onError: (error: any) => {
      console.log(error)
      const errorMessage = error.response?.data?.message || "Failed to update note"
      setError(errorMessage)
      showToast.error(errorMessage)
    },
  })

  // Toggle pin mutation
  const pinMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/entry/pin/${id}`)
      return response.data.data.pinnedEntry
    },
    onSuccess: (updatedNote) => {
      togglePin(id!)
      queryClient.invalidateQueries({ queryKey: ["note", id] })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      showToast.success(updatedNote.isPinned ? "Note pinned!" : "Note unpinned!")
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to pin/unpin note"
      showToast.error(errorMessage)
    },
  })

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/entry/bookmark/${id}`)
      return response.data.data.bookmarkedEntry
    },
    onSuccess: (updatedNote) => {
      toggleBookmark(id!)
      queryClient.invalidateQueries({ queryKey: ["note", id] })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      showToast.success(updatedNote.isBookmarked ? "Note bookmarked!" : "Bookmark removed!")
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to bookmark/unbookmark note"
      showToast.error(errorMessage)
    },
  })

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/entry/${id}`, { isDeleted: true })
    },
    onSuccess: () => {
      deleteNote(id!)
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      showToast.success("Note moved to trash!")
      navigate("/app/notes")
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete note"
      showToast.error(errorMessage)
    },
  })

  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      formData.title !== originalData.title ||
      formData.synopsis !== originalData.synopsis ||
      formData.content !== originalData.content
    setHasChanges(hasFormChanges)
  }, [formData, originalData])

  const handleInputChange =
    (field: keyof EditNoteFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!hasChanges) {
      showToast.info("No changes to save")
      return
    }
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?")
      if (!confirmDiscard) return
      
      // Reset form to original data
      setFormData(originalData)
      setHasChanges(false)
    }
    navigate(-1)
  }

  const handleTogglePin = () => {
    pinMutation.mutate()
  }

  const handleToggleBookmark = () => {
    bookmarkMutation.mutate()
  }

  const handleDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note? It will be moved to trash.")
    if (confirmDelete) {
      deleteMutation.mutate()
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  // Handle query error
  if (queryError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Failed to load note: {queryError.message || "Unknown error occurred"}
        </Alert>
      </Container>
    )
  }

  // Handle missing note data
  if (!noteData) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Note not found</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Edit Note
            </Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <Chip
                icon={<CalendarToday />}
                label={`Created ${format(new Date(noteData.dateCreated), "MMM dd, yyyy")}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<AccessTime />}
                label={`Updated ${formatDistanceToNow(new Date(noteData.lastUpdated))} ago`}
                size="small"
                variant="outlined"
                color="secondary"
              />
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title={noteData.isPinned ? "Unpin note" : "Pin note"}>
              <IconButton
                onClick={handleTogglePin}
                color={noteData.isPinned ? "primary" : "default"}
                disabled={pinMutation.isPending}
              >
                <PushPin />
              </IconButton>
            </Tooltip>

            <Tooltip title={noteData.isBookmarked ? "Remove bookmark" : "Bookmark note"}>
              <IconButton
                onClick={handleToggleBookmark}
                color={noteData.isBookmarked ? "secondary" : "default"}
                disabled={bookmarkMutation.isPending}
              >
                <Bookmark />
              </IconButton>
            </Tooltip>

            <Tooltip title="View note">
              <IconButton onClick={() => navigate(`/app/notes/view/${id}`)}>
                <Visibility />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete note">
              <IconButton onClick={handleDelete} color="error" disabled={deleteMutation.isPending}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Edit color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Edit Your Note
              </Typography>
              {hasChanges && <Chip label="Unsaved changes" size="small" color="warning" variant="outlined" />}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box mb={3}>
              <TextField
                fullWidth
                label="Note Title"
                value={formData.title}
                onChange={handleInputChange("title")}
                required
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.1rem",
                    fontWeight: 500,
                  },
                }}
              />
            </Box>

            <Box mb={3}>
              <TextField
                fullWidth
                label="Synopsis"
                value={formData.synopsis}
                onChange={handleInputChange("synopsis")}
                multiline
                rows={2}
                variant="outlined"
                helperText="A brief summary of your note"
              />
            </Box>

            <Box mb={4}>
              <TextField
                fullWidth
                label="Content"
                value={formData.content}
                onChange={handleInputChange("content")}
                multiline
                rows={12}
                variant="outlined"
                required
                helperText="Write your note content here"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1rem",
                    lineHeight: 1.6,
                  },
                }}
              />
            </Box>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<Cancel />}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={!hasChanges || updateMutation.isPending}
                sx={{
                  background: hasChanges ? "linear-gradient(45deg, #6366f1, #8b5cf6)" : undefined,
                  "&:hover": hasChanges
                    ? {
                        background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                      }
                    : undefined,
                }}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}