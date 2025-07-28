import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material"
import {
  MoreVert,
  Edit,
  Delete,
  PushPin,
  Bookmark,
  Visibility,
  PinDropOutlined,
  BookmarkBorderOutlined,
  ArrowBack,
} from "@mui/icons-material"
import { useNotesStore } from "../store/NotesStore"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { formatDistanceToNow } from "date-fns"

interface NoteCardProps {
  note: {
    id: string
    title: string
    synopsis: string
    content: string
    dateCreated: string
    lastUpdated: string
    isPinned: boolean
    isBookmarked: boolean
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onTogglePin: (id: string) => void
  onToggleBookmark: (id: string) => void
}

// Reusing the NoteCard component from AllNotesPage for consistency
function NoteCard({ note, onEdit, onDelete, onView, onTogglePin, onToggleBookmark }: NoteCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (action: () => void) => {
    action()
    handleMenuClose()
  }

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
        border: note.isPinned ? "2px solid" : "1px solid",
        borderColor: note.isPinned ? "primary.main" : "divider",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h2" fontWeight={600} sx={{ flexGrow: 1, mr: 1 }}>
            {note.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {note.isPinned && <PinDropOutlined color="primary" fontSize="small" />}
            {note.isBookmarked && <BookmarkBorderOutlined color="secondary" fontSize="small" />}
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {note.synopsis}
        </Typography>

        <Box display="flex" gap={1} mb={2}>
          <Chip
            label={`Created ${formatDistanceToNow(new Date(note.dateCreated))} ago`}
            size="small"
            variant="outlined"
          />
          {note.lastUpdated !== note.dateCreated && (
            <Chip
              label={`Updated ${formatDistanceToNow(new Date(note.lastUpdated))} ago`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button
          startIcon={<Visibility />}
          onClick={() => onView(note.id)}
          sx={{
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
            },
          }}
        >
          Read More
        </Button>

        <Box display="flex" gap={1}>
          <IconButton size="small" onClick={() => onTogglePin(note.id)} color={note.isPinned ? "primary" : "default"}>
            <PushPin />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onToggleBookmark(note.id)}
            color={note.isBookmarked ? "secondary" : "default"}
          >
            <Bookmark />
          </IconButton>
        </Box>
      </CardActions>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction(() => onView(note.id))}>
          <Visibility sx={{ mr: 2 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onEdit(note.id))}>
          <Edit sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onTogglePin(note.id))}>
          <PushPin sx={{ mr: 2 }} />
          {note.isPinned ? "Unpin" : "Pin"}
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onToggleBookmark(note.id))}>
          <Bookmark sx={{ mr: 2 }} />
          {note.isBookmarked ? "Remove Bookmark" : "Bookmark"}
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onDelete(note.id))} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default function PinnedNotesPage() {
  const navigate = useNavigate()
  const { notes, setNotes, deleteNote, togglePin, toggleBookmark, setError, error, clearError } = useNotesStore()

  // Fetch notes from backend
  const { data: notesData, isLoading } = useQuery({
    queryKey: ["notes", "pinned"],
    queryFn: async () => {
      const response = await axiosInstance.get("/notes?isPinned=true")
      return response.data
    },
  })

  const pinnedNotes = notes.filter((note) => !note.isDeleted && note.isPinned)

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await axiosInstance.patch(`/notes/${noteId}`, { isDeleted: true })
    },
    onSuccess: (_, noteId) => {
      deleteNote(noteId)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to delete note")
    },
  })

  // Toggle pin mutation
  const pinMutation = useMutation({
    mutationFn: async ({ noteId, isPinned }: { noteId: string; isPinned: boolean }) => {
      await axiosInstance.patch(`/notes/${noteId}`, { isPinned })
    },
    onSuccess: (_, { noteId }) => {
      togglePin(noteId)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to update note")
    },
  })

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ noteId, isBookmarked }: { noteId: string; isBookmarked: boolean }) => {
      await axiosInstance.patch(`/notes/${noteId}`, { isBookmarked })
    },
    onSuccess: (_, { noteId }) => {
      toggleBookmark(noteId)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to update note")
    },
  })

  const handleEdit = (id: string) => {
    navigate(`/app/notes/edit/${id}`)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleView = (id: string) => {
    navigate(`/app/notes/view/${id}`)
  }

  const handleTogglePin = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      pinMutation.mutate({ noteId: id, isPinned: !note.isPinned })
    }
  }

  const handleToggleBookmark = (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      bookmarkMutation.mutate({ noteId: id, isBookmarked: !note.isBookmarked })
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/dashboard")} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Pinned Entries
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your most important notes, always at your fingertips.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {pinnedNotes.length === 0 ? (
        <Card
          sx={{
            textAlign: "center",
            py: 8,
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            border: "2px dashed",
            borderColor: "primary.light",
          }}
        >
          <CardContent>
            <PinDropOutlined
              sx={{
                fontSize: 80,
                color: "primary.light",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No pinned notes yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Pin your most important notes to see them here!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/app/notes")}
              sx={{
                mt: 2,
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                },
              }}
            >
              View All Notes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {pinnedNotes.map((note) => (
            <Grid size={{xs:12, sm:6, md:4}} key={note.id}>
              <NoteCard
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onTogglePin={handleTogglePin}
                onToggleBookmark={handleToggleBookmark}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
