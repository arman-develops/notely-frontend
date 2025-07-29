import type React from "react"

import { useState, useEffect } from "react"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import { MoreVert, RestoreFromTrash, DeleteForever, Description, ArrowBack } from "@mui/icons-material"
import { useNotesStore } from "../store/NotesStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { formatDistanceToNow, format } from "date-fns"

interface TrashNote {
  id: string
  noteTitle: string
  synopsis: string
  content?: string
  dateCreated: string
  lastUpdated: string
  deletedAt?: string
}

interface TrashNoteCardProps {
  note: TrashNote
  onRestore: (id: string) => void
  onPermanentlyDelete: (id: string) => void
  isRestoring?: boolean
  isDeleting?: boolean
}

function TrashNoteCard({ note, onRestore, onPermanentlyDelete, isRestoring, isDeleting }: TrashNoteCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  const handlePermanentDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmPermanentDelete = () => {
    onPermanentlyDelete(note.id)
    setShowDeleteDialog(false)
  }

  const getDeletedTime = () => {
    // Use deletedAt if available, otherwise fall back to lastUpdated
    const deleteTime = note.deletedAt || note.lastUpdated
    try {
      return formatDistanceToNow(new Date(deleteTime)) + ' ago'
    } catch (error) {
      return 'Unknown time'
    }
  }

  const getCreatedDate = () => {
    try {
      return format(new Date(note.dateCreated), "PPP")
    } catch (error) {
      return 'Unknown date'
    }
  }

  return (
    <>
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
          borderColor: "error.light",
          backgroundColor: "rgba(255, 0, 0, 0.02)",
          opacity: isRestoring || isDeleting ? 0.6 : 1,
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography 
              variant="h6" 
              component="h2" 
              fontWeight={600} 
              sx={{ 
                flexGrow: 1, 
                mr: 1,
                textDecoration: 'line-through',
                color: 'text.secondary'
              }}
            >
              {note.noteTitle || 'Untitled'}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              disabled={isRestoring || isDeleting}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{ fontStyle: 'italic' }}
          >
            {note.synopsis || 'No synopsis available'}
          </Typography>

          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Chip 
              label={`Created ${getCreatedDate()}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip
              label={`Deleted ${getDeletedTime()}`}
              size="small"
              variant="outlined"
              color="error"
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "center", px: 2, pb: 2, gap: 1 }}>
          <Button
            startIcon={<RestoreFromTrash />}
            onClick={() => onRestore(note.id)}
            variant="contained"
            color="success"
            disabled={isRestoring || isDeleting}
            size="small"
            sx={{
              minWidth: 100,
              textTransform: 'none',
            }}
          >
            {isRestoring ? 'Restoring...' : 'Restore'}
          </Button>
          <Button
            startIcon={<DeleteForever />}
            onClick={handlePermanentDelete}
            variant="outlined"
            color="error"
            disabled={isRestoring || isDeleting}
            size="small"
            sx={{
              minWidth: 120,
              textTransform: 'none',
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Forever'}
          </Button>
        </CardActions>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem 
            onClick={() => handleAction(() => onRestore(note.id))}
            disabled={isRestoring || isDeleting}
          >
            <RestoreFromTrash sx={{ mr: 2, color: 'success.main' }} />
            Restore
          </MenuItem>
          <MenuItem 
            onClick={() => handleAction(handlePermanentDelete)} 
            sx={{ color: "error.main" }}
            disabled={isRestoring || isDeleting}
          >
            <DeleteForever sx={{ mr: 2 }} />
            Delete Permanently
          </MenuItem>
        </Menu>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Permanently Delete Note?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to permanently delete "{note.noteTitle}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmPermanentDelete} color="error" variant="contained">
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default function TrashPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setNotes, restoreNote, permanentlyDeleteNote, setError, error, clearError } = useNotesStore()
  const [restoringNotes, setRestoringNotes] = useState<Set<string>>(new Set())
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set())

  // Fetch deleted notes from backend
  const { data: trashNotesData, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["trashNotes"],
    queryFn: async () => {
      const response = await axiosInstance.get("/entries/trash")
      return response.data.data.trashedEntries
    },
    retry: 2,
    retryDelay: 1000,
  })

  // Update store when trash data is fetched
  useEffect(() => {
    if (trashNotesData) {
      // Mark all fetched notes as deleted in the store
      const deletedNotes = trashNotesData.map((note: any) => ({
        ...note,
        isDeleted: true,
      }))
      setNotes(deletedNotes)
      clearError()
    }
  }, [trashNotesData, setNotes])

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      setError("Failed to fetch deleted notes. Please try again.")
    }
  }, [queryError, setError])

  // Use fetched data as source of truth
  const deletedNotes: TrashNote[] = trashNotesData || []

  // Restore note mutation
  const restoreMutation = useMutation({
    mutationFn: async (noteId: string) => {
      // Try different possible endpoints
        await axiosInstance.patch(`/entry/restore/${noteId}`)
    },
    onMutate: (noteId) => {
      setRestoringNotes(prev => new Set(prev).add(noteId))
    },
    onSuccess: (_, noteId) => {
      restoreNote(noteId)
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["trashNotes"] })
      setRestoringNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(noteId)
        return newSet
      })
      clearError()
    },
    onError: (error: any, noteId) => {
      setError(error.response?.data?.message || "Failed to restore note")
      setRestoringNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(noteId)
        return newSet
      })
    },
  })

  // Permanently delete note mutation
  const permanentlyDeleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      // Try different possible endpoints for permanent deletion
      try {
        await axiosInstance.delete(`/entries/${noteId}`)
      } catch (error) {
        // Fallback to alternative endpoint
        await axiosInstance.delete(`/notes/${noteId}`)
      }
    },
    onMutate: (noteId) => {
      setDeletingNotes(prev => new Set(prev).add(noteId))
    },
    onSuccess: (_, noteId) => {
      permanentlyDeleteNote(noteId)
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["trashNotes"] })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setDeletingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(noteId)
        return newSet
      })
    },
    onError: (error: any, noteId) => {
      setError(error.response?.data?.message || "Failed to permanently delete note")
      setDeletingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(noteId)
        return newSet
      })
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
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Failed to load trash. Please refresh the page or try again later.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/dashboard")} sx={{ mb: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Trash ({deletedNotes.length})
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Notes you've deleted. You can restore them or delete them permanently.
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
        <>
          <Box mb={3}>
            <Alert severity="info">
              <Typography variant="body2">
                You have {deletedNotes.length} note{deletedNotes.length !== 1 ? 's' : ''} in trash. 
                You can restore them or delete them permanently.
              </Typography>
            </Alert>
          </Box>
          
          <Grid container spacing={3}>
            {trashNotesData.map((note:any) => (
              <Grid size={{xs:12, sm:6, md:4}} key={note.noteID}>
                <TrashNoteCard 
                  note={note} 
                  onRestore={() => {handleRestore(note.noteID)}} 
                  onPermanentlyDelete={handlePermanentlyDelete}
                  isRestoring={restoringNotes.has(note.id)}
                  isDeleting={deletingNotes.has(note.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  )
}