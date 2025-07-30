"use client";

import type React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Grid,
  Divider,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  PushPin,
  Bookmark,
  PinDropOutlined,
  BookmarkBorderOutlined,
  Share,
  Print,
  Psychology,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../service/AxiosInstance";
import { useNotesStore } from "../store/NotesStore";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow, format } from "date-fns";
import { showToast } from "../utils/toast";
import AIAnalysis from "../components/ai/ai-analysis";

export default function ViewNotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { deleteNote, togglePin, toggleBookmark, getNoteById } =
    useNotesStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  // Get note from store first (for immediate display)
  const storeNote = getNoteById(id!);

  // Fetch note from backend
  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/entry/${id}`);
      return response.data.data.entry;
    },
    enabled: !!id,
    initialData: storeNote,
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch(`/entry/${id}`, { isDeleted: true });
    },
    onSuccess: () => {
      deleteNote(id!);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showToast.success("Note moved to trash!");
      navigate("/app/notes");
    },
    onError: () => {
      showToast.error("Failed to delete note");
    },
  });

  // Toggle pin mutation
  const pinMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/entry/pin/${id}`);
      return response.data.data.pinnedEntry;
    },
    onSuccess: (updatedNote) => {
      togglePin(id!);
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showToast.success(
        updatedNote.isPinned ? "Note pinned!" : "Note unpinned!",
      );
    },
    onError: () => {
      showToast.error("Failed to pin/unpin note");
    },
  });

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/entry/bookmark/${id}`);
      return response.data.data.bookmarkedEntry;
    },
    onSuccess: (updatedNote) => {
      toggleBookmark(id!);
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showToast.success(
        updatedNote.isBookmarked ? "Note bookmarked!" : "Bookmark removed!",
      );
    },
    onError: () => {
      showToast.error("Failed to bookmark/unbookmark note");
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/app/notes/edit/${id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note? It will be moved to trash.",
    );
    if (confirmDelete) {
      deleteMutation.mutate();
    }
    handleMenuClose();
  };

  const handleTogglePin = () => {
    pinMutation.mutate();
    handleMenuClose();
  };

  const handleToggleBookmark = () => {
    bookmarkMutation.mutate();
    handleMenuClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note?.noteTitle,
        text: note?.synopsis,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied to clipboard!");
    }
    handleMenuClose();
  };

  const handlePrint = () => {
    window.print();
    handleMenuClose();
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

  if (error || !note) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {note?.isDeleted ? "This note has been deleted." : "Note not found."}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/app/notes")}
          sx={{ mt: 2 }}
        >
          Back to Notes
        </Button>
      </Container>
    );
  }

  if (note.isDeleted) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>
          This note has been moved to trash.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/app/notes")}
          sx={{ mt: 2 }}
        >
          Back to Notes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/app/notes")}
          sx={{ mb: 2 }}
        >
          Back to Notes
        </Button>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h4" component="h1" fontWeight={600}>
                {note.noteTitle}
              </Typography>
              {note.isPinned && <PinDropOutlined color="primary" />}
              {note.isBookmarked && (
                <BookmarkBorderOutlined color="secondary" />
              )}
            </Box>

            {note.synopsis && (
              <Typography variant="h6" color="text.secondary" paragraph>
                {note.synopsis}
              </Typography>
            )}

            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={`Created ${format(new Date(note.dateCreated), "PPP")}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${formatDistanceToNow(new Date(note.dateCreated))} ago`}
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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: showAIAnalysis ? 8 : 12 }}>
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
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
            </CardContent>
          </Card>
        </Grid>

        {showAIAnalysis && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box position="sticky" top={20}>
              <AIAnalysis
                text={note.content}
                title={note.noteTitle}
                autoAnalyze={true}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
          },
        }}
        onClick={() => setShowAIAnalysis(!showAIAnalysis)}
      >
        <Tooltip
          title={showAIAnalysis ? "Hide AI Analysis" : "Show AI Analysis"}
        >
          <Psychology />
        </Tooltip>
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
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
        <Divider />
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 2 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <Print sx={{ mr: 2 }} />
          Print
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
}
