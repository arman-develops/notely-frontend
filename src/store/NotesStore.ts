import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Note {
  id: string
  title: string
  synopsis: string
  content: string
  dateCreated: string
  lastUpdated: string
  isDeleted: boolean
  isPinned: boolean
  isBookmarked: boolean
  userId: string
}

interface NotesState {
  notes: Note[]
  isLoading: boolean
  error: string | null

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Omit<Note, "id" | "dateCreated" | "lastUpdated">) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  restoreNote: (id: string) => void
  permanentlyDeleteNote: (id: string) => void
  togglePin: (id: string) => void
  toggleBookmark: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Getters
  getActiveNotes: () => Note[]
  getDeletedNotes: () => Note[]
  getPinnedNotes: () => Note[]
  getBookmarkedNotes: () => Note[]
  getNoteById: (id: string) => Note | undefined
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      isLoading: false,
      error: null,

      setNotes: (notes) => set({ notes }),

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: Date.now().toString(),
          dateCreated: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }
        set((state) => ({ notes: [newNote, ...state.notes] }))
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  lastUpdated: new Date().toISOString(),
                }
              : note,
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, isDeleted: true } : note)),
        }))
      },

      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, isDeleted: false } : note)),
        }))
      },

      permanentlyDeleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }))
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, isPinned: !note.isPinned } : note)),
        }))
      },

      toggleBookmark: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, isBookmarked: !note.isBookmarked } : note)),
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Getters
      getActiveNotes: () => get().notes.filter((note) => !note.isDeleted),

      getDeletedNotes: () => get().notes.filter((note) => note.isDeleted),

      getPinnedNotes: () => get().notes.filter((note) => !note.isDeleted && note.isPinned),

      getBookmarkedNotes: () => get().notes.filter((note) => !note.isDeleted && note.isBookmarked),

      getNoteById: (id) => get().notes.find((note) => note.id === id),
    }),
    {
      name: "notes-storage",
    },
  ),
)
