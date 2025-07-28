import type React from "react"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material"
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  PushPin,
  Bookmark,
  PinDropOutlined,
  BookmarkBorderOutlined,
} from "@mui/icons-material"
import { useQuery, useMutation } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { useNotesStore } from "../store/NotesStore"
import ReactMarkdown from "react-markdown"
import { formatDistanceToNow, format } from "date-fns"

export default function ViewNotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { deleteNote, togglePin, toggleBookmark, getNoteById } = useNotesStore()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Get note from store first (for immediate display)
  const storeNote = getNoteById(id!)

  // Fetch note from backend
  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/notes/${id}`)
      return response.data.note
    },
    enabled: !!id,
    initialData: storeNote,
  })

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/notes/${id}`, { isDeleted: true })
    },
    onSuccess: () => {
      deleteNote(id!)
      navigate("/app/notes")
    },
  })

  // Toggle pin mutation
  const pinMutation = useMutation({
    mutationFn: async (isPinned: boolean) => {
      await axiosInstance.patch(`/notes/${id}`, { isPinned })
    },
    onSuccess: () => {
      togglePin(id!)
    },
  })

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (isBookmarked: boolean) => {
      await axiosInstance.patch(`/notes/${id}`, { isBookmarked })
    },
    onSuccess: () => {
      toggleBookmark(id!)
    },
  })

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    navigate(`/app/notes/edit/${id}`)
    handleMenuClose()
  }

  const handleDelete = () => {
    deleteMutation.mutate()
    handleMenuClose()
  }

  const handleTogglePin = () => {
    pinMutation.mutate(!note.isPinned)
    handleMenuClose()
  }

  const handleToggleBookmark = () => {
    bookmarkMutation.mutate(!note.isBookmarked)
    handleMenuClose()
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !note) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {note?.isDeleted ? "This note has been deleted." : "Note not found."}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/notes")} sx={{ mt: 2 }}>
          Back to Notes
        </Button>
      </Container>
    )
  }

  if (note.isDeleted) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>
          This note has been moved to trash.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/notes")} sx={{ mt: 2 }}>
          Back to Notes
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/notes")} sx={{ mb: 2 }}>
          Back to Notes
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h4" component="h1" fontWeight={600}>
                {note.title}
              </Typography>
              {note.isPinned && <PinDropOutlined color="primary" />}
              {note.isBookmarked && <BookmarkBorderOutlined color="secondary" />}
            </Box>

            <Typography variant="h6" color="text.secondary" paragraph>
              {note.synopsis}
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`Created ${format(new Date(note.dateCreated), "PPP")}`} size="small" variant="outlined" />
              <Chip label={`${formatDistanceToNow(new Date(note.dateCreated))} ago`} size="small" variant="outlined" />
              {note.lastUpdated !== note.dateCreated && (
                <Chip
                  label={`Updated ${formatDistanceToNow(new Date(note.lastUpdated))} ago`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                },
              }}
            >
              Edit
            </Button>

            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              marginTop: 2,
              marginBottom: 1,
              fontWeight: 600,
            },
            "& p": {
              marginBottom: 2,
              lineHeight: 1.7,
            },
            "& ul, & ol": {
              marginBottom: 2,
              paddingLeft: 3,
            },
            "& li": {
              marginBottom: 0.5,
            },
            "& blockquote": {
              borderLeft: "4px solid",
              borderColor: "primary.main",
              paddingLeft: 2,
              marginLeft: 0,
              marginBottom: 2,
              fontStyle: "italic",
              backgroundColor: "grey.50",
              padding: 2,
            },
            "& code": {
              backgroundColor: "grey.100",
              padding: "2px 4px",
              borderRadius: 1,
              fontFamily: "monospace",
            },
            "& pre": {
              backgroundColor: "grey.100",
              padding: 2,
              borderRadius: 1,
              overflow: "auto",
              marginBottom: 2,
            },
          }}
        >
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </Box>
      </Paper>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleTogglePin}>
          <PushPin sx={{ mr: 2 }} />
          {note.isPinned ? "Unpin" : "Pin"}
        </MenuItem>
        <MenuItem onClick={handleToggleBookmark}>
          <Bookmark sx={{ mr: 2 }} />
          {note.isBookmarked ? "Remove Bookmark" : "Bookmark"}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  )
}
