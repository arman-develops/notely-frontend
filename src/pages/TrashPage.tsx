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
import { MoreVert, RestoreFromTrash, DeleteForever, Description, ArrowBack } from "@mui/icons-material"
import { useNotesStore } from "../store/NotesStore"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { formatDistanceToNow, format } from "date-fns"

interface TrashNoteCardProps {
  note: {
    id: string
    title: string
    synopsis: string
    dateCreated: string
    lastUpdated: string
  }
  onRestore: (id: string) => void
  onPermanentlyDelete: (id: string) => void
}

function TrashNoteCard({ note, onRestore, onPermanentlyDelete }: TrashNoteCardProps) {
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
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h2" fontWeight={600} sx={{ flexGrow: 1, mr: 1 }}>
            {note.title}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {note.synopsis}
        </Typography>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip label={`Created ${format(new Date(note.dateCreated), "PPP")}`} size="small" variant="outlined" />
          <Chip
            label={`Deleted ${formatDistanceToNow(new Date(note.lastUpdated))} ago`}
            size="small"
            variant="outlined"
            color="error"
          />
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button
          startIcon={<RestoreFromTrash />}
          onClick={() => onRestore(note.id)}
          sx={{
            background: "linear-gradient(45deg, #10b981, #059669)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(45deg, #059669, #047857)",
            },
          }}
        >
          Restore
        </Button>
        <Button
          startIcon={<DeleteForever />}
          onClick={() => onPermanentlyDelete(note.id)}
          color="error"
          variant="outlined"
        >
          Delete Permanently
        </Button>
      </CardActions>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction(() => onRestore(note.id))}>
          <RestoreFromTrash sx={{ mr: 2 }} />
          Restore
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onPermanentlyDelete(note.id))} sx={{ color: "error.main" }}>
          <DeleteForever sx={{ mr: 2 }} />
          Delete Permanently
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default function TrashPage() {
  const navigate = useNavigate()
  const { notes, setNotes, restoreNote, permanentlyDeleteNote, setError, error, clearError } = useNotesStore()

  // Fetch deleted notes from backend
  const { data: trashNotesData, isLoading } = useQuery({
    queryKey: ["trashNotes"],
    queryFn: async () => {
      const response = await axiosInstance.get("/notes/trash")
      return response.data
    },
  })

  const deletedNotes = notes.filter((note) => note.isDeleted)

  // Restore note mutation
  const restoreMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await axiosInstance.patch(`/notes/${noteId}`, { isDeleted: false })
    },
    onSuccess: (_, noteId) => {
      restoreNote(noteId)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to restore note")
    },
  })

  // Permanently delete note mutation
  const permanentlyDeleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await axiosInstance.delete(`/notes/${noteId}`)
    },
    onSuccess: (_, noteId) => {
      permanentlyDeleteNote(noteId)
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to permanently delete note")
    },
  })

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id)
  }

  const handlePermanentlyDelete = (id: string) => {
    permanentlyDeleteMutation.mutate(id)
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
          Trash
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Notes you've deleted. They will be permanently removed after 30 days.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {deletedNotes.length === 0 ? (
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
            <Description
              sx={{
                fontSize: 80,
                color: "primary.light",
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              Your trash is empty!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              No notes have been deleted yet.
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
          {deletedNotes.map((note) => (
            <Grid size={{xs:12, sm:6, md:4}} key={note.id}>
              <TrashNoteCard note={note} onRestore={handleRestore} onPermanentlyDelete={handlePermanentlyDelete} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
