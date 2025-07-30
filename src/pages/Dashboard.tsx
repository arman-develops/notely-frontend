import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Container,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  Add,
  TrendingUp,
  Description,
  PushPin,
  Bookmark,
  Delete,
  Edit,
  Visibility,
  Schedule,
  Star,
  ArrowForward,
  Analytics,
  Today,
  CalendarMonth,
} from "@mui/icons-material"
import { useAuthStore } from "../store/AuthStore"
import { useNotesStore } from "../store/NotesStore"
import { useQuery } from "@tanstack/react-query"
import axiosInstance from "../service/AxiosInstance"
import { formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval, format, startOfDay, endOfDay } from "date-fns"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: number
  onClick?: () => void
}

function StatCard({ title, value, icon, color, trend, onClick }: StatCardProps) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: theme.shadows[8],
            }
          : {},
        background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 1,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color}>
              {value}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp
                  sx={{
                    fontSize: 16,
                    mr: 0.5,
                    color: trend >= 0 ? "success.main" : "error.main",
                  }}
                />
                <Typography variant="body2" color={trend >= 0 ? "success.main" : "error.main"}>
                  {trend >= 0 ? "+" : ""}
                  {trend}% this week
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

function QuickAction({ title, description, icon, color, onClick }: QuickActionProps) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
          backgroundColor: alpha(color, 0.05),
        },
        border: `1px solid ${alpha(color, 0.1)}`,
        borderRadius: 0.5,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", py: 2 }}>
        <Avatar
          sx={{
            backgroundColor: alpha(color, 0.1),
            color: color,
            mr: 2,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ArrowForward sx={{ color: "text.secondary" }} />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setNotes, error: storeError } = useNotesStore()

  // Fetch notes from backend
  const { data: notesData, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await axiosInstance.get("/entries")
      return response.data.data.entries
    },
    retry: 2,
    retryDelay: 1000,
  })

  // Update store when data is fetched successfully
  React.useEffect(() => {
    if (notesData) {
      setNotes(notesData)
    }
  }, [notesData, setNotes])

  // Use fetched data as source of truth
  const notes = notesData || []

  // Calculate statistics with proper error handling
  const activeNotes = notes.filter((note: any) => !note.isDeleted)
  const pinnedNotes = notes.filter((note: any) => !note.isDeleted && note.isPinned)
  const bookmarkedNotes = notes.filter((note: any) => !note.isDeleted && note.isBookMarked)
  const trashedNotes = notes.filter((note: any) => note.isDeleted)

  // Calculate this week's notes with proper date handling
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Start week on Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  
  const thisWeekNotes = notes.filter((note: any) => {
    try {
      const noteDate = new Date(note.dateCreated)
      return isWithinInterval(noteDate, { start: weekStart, end: weekEnd })
    } catch (error) {
      console.warn('Invalid date in note:', note.dateCreated)
      return false
    }
  })

  // Calculate today's notes
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const todayNotes = notes.filter((note: any) => {
    try {
      const noteDate = new Date(note.dateCreated)
      return isWithinInterval(noteDate, { start: todayStart, end: todayEnd })
    } catch (error) {
      console.warn('Invalid date in note:', note.dateCreated)
      return false
    }
  })

  // Calculate previous week for trend calculation
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const prevWeekEnd = new Date(weekEnd)
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)
  
  const lastWeekNotes = notes.filter((note: any) => {
    try {
      const noteDate = new Date(note.dateCreated)
      return isWithinInterval(noteDate, { start: prevWeekStart, end: prevWeekEnd })
    } catch (error) {
      return false
    }
  })

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const notesTrend = calculateTrend(thisWeekNotes.length, lastWeekNotes.length)

  // Recent notes (last 5) with proper sorting
  const recentNotes = activeNotes
    .filter((note: any) => note.lastUpdated) // Filter out notes without lastUpdated
    .sort((a: any, b: any) => {
      try {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      } catch (error) {
        return 0
      }
    })
    .slice(0, 5)

  // Calculate writing streak (mock implementation - you'd want to implement this properly)
  const calculateWritingStreak = (): number => {
    const sortedNotes = notes
      .filter((note: any) => !note.isDeleted)
      .sort((a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    
    if (sortedNotes.length === 0) return 0
    
    let streak = 0
    let currentDate = new Date()
    
    // Simple streak calculation - check if there's a note each day going backwards
    for (let i = 0; i < 30; i++) { // Check up to 30 days
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() - i)
      
      const hasNoteOnDate = sortedNotes.some((note: any) => {
        try {
          const noteDate = new Date(note.dateCreated)
          return format(noteDate, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
        } catch (error) {
          return false
        }
      })
      
      if (hasNoteOnDate) {
        streak++
      } else if (i > 0) { // Don't break on first day if no note today
        break
      }
    }
    
    return streak
  }

  const writingStreak = calculateWritingStreak()
  const weeklyGoal = 10
  const weeklyProgress = weeklyGoal > 0 ? (thisWeekNotes.length / weeklyGoal) * 100 : 0

  const quickActions = [
    {
      title: "New Entry",
      description: "Start writing a new note",
      icon: <Add />,
      color: theme.palette.success.main,
      onClick: () => navigate("/app/notes/new"),
    },
    {
      title: "View All Notes",
      description: "Browse your collection",
      icon: <Description />,
      color: theme.palette.primary.main,
      onClick: () => navigate("/app/notes"),
    },
    {
      title: "Pinned Notes",
      description: "Quick access to important notes",
      icon: <PushPin />,
      color: theme.palette.warning.main,
      onClick: () => navigate("/app/notes/pinned"),
    },
    {
      title: "Analytics",
      description: "View your writing insights",
      icon: <Analytics />,
      color: theme.palette.info.main,
      onClick: () => navigate("/app/analytics"),
    },
  ]

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  // Calculate most active day (mock implementation)
  const getMostActiveDay = (): string => {
    const dayStats: { [key: string]: number } = {}
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    notes.forEach((note: any) => {
      try {
        const noteDate = new Date(note.dateCreated)
        const dayName = dayNames[noteDate.getDay()]
        dayStats[dayName] = (dayStats[dayName] || 0) + 1
      } catch (error) {
        // Skip invalid dates
        console.log(error)
      }
    })
    
    const mostActiveDay = Object.entries(dayStats).reduce(
      (max, [day, count]) => count > max.count ? { day, count } : max,
      { day: 'Monday', count: 0 }
    )
    
    return mostActiveDay.day
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 4 }}>
          Failed to load dashboard data. Please refresh the page or try again later.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {getGreeting()}, {user?.firstName || 'User'}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Ready to capture your thoughts and ideas today?
        </Typography>
      </Box>

      {(storeError || queryError) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some data might not be up to date. Please refresh if you encounter issues.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Total Notes"
            value={activeNotes.length}
            icon={<Description />}
            color={theme.palette.primary.main}
            trend={notesTrend}
            onClick={() => navigate("/app/notes")}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Pinned Notes"
            value={pinnedNotes.length}
            icon={<PushPin />}
            color={theme.palette.warning.main}
            onClick={() => navigate("/app/notes/pinned")}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Bookmarked"
            value={bookmarkedNotes.length}
            icon={<Bookmark />}
            color={theme.palette.info.main}
            onClick={() => navigate("/app/notes/bookmarked")}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="In Trash"
            value={trashedNotes.length}
            icon={<Delete />}
            color={theme.palette.error.main}
            onClick={() => navigate("/app/notes/trash")}
          />
        </Grid>

        <Grid size={{xs:12, md:8}}>
          <Card sx={{ height: "100%", borderRadius: 1, boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Writing Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your weekly writing goal
                  </Typography>
                </Box>
                <Chip
                  icon={<Today />}
                  label={`${thisWeekNotes.length}/${weeklyGoal} notes this week`}
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Math.round(Math.min(weeklyProgress, 100))}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(weeklyProgress, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 1,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    },
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{xs:6}}>
                  <Box
                    textAlign="center"
                    p={2}
                    sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}
                  >
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {writingStreak}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Day Streak
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{xs:6}}>
                  <Box
                    textAlign="center"
                    p={2}
                    sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}
                  >
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {thisWeekNotes.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notes This Week
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:4}}>
          <Card sx={{ height: "100%", borderRadius: 1, boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Jump to common tasks
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                {quickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:8}}>
          <Card sx={{ borderRadius: 1, boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your latest entries
                  </Typography>
                </Box>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/app/notes")}
                  sx={{ textTransform: "none" }}
                >
                  View All
                </Button>
              </Box>

              {recentNotes.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No notes yet.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate("/app/notes/new")}
                    sx={{
                      background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                      },
                      borderRadius: 2,
                    }}
                  >
                    Create Your First Note
                  </Button>
                </Box>
              ) : (
                <List>
                  {recentNotes.map((note: any, index: number) => (
                    <React.Fragment key={note.noteID}>
                      <ListItem
                        sx={{
                          cursor: "pointer",
                          borderRadius: 2,
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                          py: 1.5,
                        }}
                        onClick={() => navigate(`/app/notes/view/${note.NoteID}`)}
                      >
                        <ListItemIcon>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {note.isPinned && <PushPin sx={{ fontSize: 18, color: "warning.main" }} />}
                            {note.isBookmarked && <Bookmark sx={{ fontSize: 18, color: "info.main" }} />}
                            <Description color="action" />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={500} noWrap>
                              {note.title || 'Untitled'}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {note.synopsis || 'No synopsis available'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Last updated: {
                                  note.lastUpdated 
                                    ? formatDistanceToNow(new Date(note.lastUpdated)) + ' ago'
                                    : 'Unknown'
                                }
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/app/notes/view/${note.noteID}`)
                            }}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/app/notes/edit/${note.noteID}`)
                            }}
                            sx={{ color: theme.palette.info.main }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < recentNotes.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs:12, md:4}}>
          <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Activity Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Your writing activity at a glance
              </Typography>

              <Box display="flex" flexDirection="column" gap={3}>
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <CalendarMonth color="primary" />
                    <Typography variant="body1" fontWeight={500}>
                      Today's Activity
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {todayNotes.length} notes created today.
                  </Typography>
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Schedule color="info" />
                    <Typography variant="body1" fontWeight={500}>
                      Most Active Day
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Historically, your most active day is {getMostActiveDay()}.
                  </Typography>
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Star color="warning" />
                    <Typography variant="body1" fontWeight={500}>
                      Total Entries
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    You have created {activeNotes.length} notes in total.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}