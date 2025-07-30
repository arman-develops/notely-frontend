import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  PushPin,
  Bookmark,
  Visibility,
  PinDropOutlined,
  BookmarkBorderOutlined,
} from "@mui/icons-material";
import { useNotesStore } from "../store/NotesStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../service/AxiosInstance";
import { formatDistanceToNow } from "date-fns";
import { showToast } from "../utils/toast";

interface NoteCardProps {
  note: {
    id: string;
    noteID: string;
    noteTitle: string;
    synopsis: string;
    content: string;
    dateCreated: string;
    lastUpdated: string;
    isPinned: boolean;
    isBookMarked: boolean;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onView,
  onTogglePin,
  onToggleBookmark,
}: NoteCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  const noteId = note.noteID || note.id;

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Typography
            variant="h6"
            component="h2"
            fontWeight={600}
            sx={{ flexGrow: 1, mr: 1 }}
          >
            {note.noteTitle}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {note.isPinned && (
              <PinDropOutlined color="primary" fontSize="small" />
            )}
            {note.isBookMarked && (
              <BookmarkBorderOutlined color="secondary" fontSize="small" />
            )}
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" component="p" mb={1}>
          {note.synopsis}
        </Typography>
        <Box display="flex" flexDirection="column" gap={1} mb={2}>
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
          onClick={() => onView(noteId)}
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
          <IconButton
            size="small"
            onClick={() => onTogglePin(noteId)}
            color={note.isPinned ? "primary" : "default"}
          >
            <PushPin />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onToggleBookmark(noteId)}
            color={note.isBookMarked ? "secondary" : "default"}
          >
            <Bookmark />
          </IconButton>
        </Box>
      </CardActions>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction(() => onView(noteId))}>
          <Visibility sx={{ mr: 2 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onEdit(noteId))}>
          <Edit sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onTogglePin(noteId))}>
          <PushPin sx={{ mr: 2 }} />
          {note.isPinned ? "Unpin" : "Pin"}
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onToggleBookmark(noteId))}>
          <Bookmark sx={{ mr: 2 }} />
          {note.isBookMarked ? "Remove Bookmark" : "Bookmark"}
        </MenuItem>
        <MenuItem
          onClick={() => handleAction(() => onDelete(noteId))}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default function AllNotesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    setNotes,
    deleteNote,
    togglePin,
    toggleBookmark,
    setError,
    error,
    clearError,
  } = useNotesStore();

  // Fetch notes from backend
  const {
    data: notesData,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await axiosInstance.get("/entries");
      return response.data.data.entries;
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Update store when data is fetched successfully
  useEffect(() => {
    if (notesData) {
      setNotes(notesData);
    }
  }, [notesData, setNotes]);

  useEffect(() => {
    if (queryError) {
      setError("Failed to fetch notes. Please try again.");
    }
  }, [queryError, setError]);

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await axiosInstance.delete(`/entry/${noteId}`);
    },
    onSuccess: (_, noteId) => {
      deleteNote(noteId);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to delete note");
    },
  });

  // Toggle pin mutation
  const pinMutation = useMutation({
    mutationFn: async ({
      noteId,
      isPinned,
    }: {
      noteId: string;
      isPinned: boolean;
    }) => {
      const response = await axiosInstance.patch(`/entry/pin/${noteId}`, {
        isPinned,
      });
      return response.data;
    },
    onSuccess: (_data, { noteId }) => {
      console.log("Pin success for note:", noteId);
      togglePin(noteId);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearError();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || "Failed to pin/unpin note");
    },
  });

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({
      noteId,
      isBookMarked,
    }: {
      noteId: string;
      isBookMarked: boolean;
    }) => {
      const response = await axiosInstance.patch(`/entry/bookmark/${noteId}`, {
        isBookMarked,
      });
      console.log("Bookmark response:", response.data);
      return response.data;
    },
    onSuccess: (_data, { noteId }) => {
      toggleBookmark(noteId);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearError();
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message || "Failed to bookmark/unbookmark note",
      );
    },
  });

  const activeNotes = (notesData || []).filter((note: any) => !note.isDeleted);

  const handleEdit = (id: string) => {
    navigate(`/app/notes/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleView = (id: string) => {
    navigate(`/app/notes/view/${id}`);
  };

  const handleTogglePin = (id: string) => {
    const note = activeNotes.find((n: any) => n.noteID === id || n.id === id);
    if (note) {
      pinMutation.mutate({ noteId: id, isPinned: !note.isPinned });
      showToast.success("Entry pinned successfully");
    } else {
      setError("Note not found");
    }
  };

  const handleToggleBookmark = (id: string) => {
    const note = activeNotes.find((n: any) => n.noteID === id || n.id === id);
    if (note) {
      bookmarkMutation.mutate({ noteId: id, isBookMarked: !note.isBookMarked });
    } else {
      setError("Note not found");
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Failed to load notes. Please refresh the page or try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          All Entries
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and organize all your notes in one place
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {activeNotes.length === 0 ? (
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
            <Typography variant="h5" gutterBottom color="text.secondary">
              No notes yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start your note-taking journey by creating your first note!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/app/notes/new")}
              sx={{
                mt: 2,
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                },
              }}
            >
              Create Your First Note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {activeNotes.map((note: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.noteID || note.id}>
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
  );
}
