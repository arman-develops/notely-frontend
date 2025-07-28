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
import { formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns"

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
  const { notes } = useNotesStore()

  // Calculate statistics
  const activeNotes = notes.filter((note) => !note.isDeleted)
  const pinnedNotes = notes.filter((note) => !note.isDeleted && note.isPinned)
  const bookmarkedNotes = notes.filter((note) => !note.isDeleted && note.isBookmarked)
  const trashedNotes = notes.filter((note) => note.isDeleted)

  // Calculate this week's notes
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  const thisWeekNotes = notes.filter((note) =>
    isWithinInterval(new Date(note.dateCreated), { start: weekStart, end: weekEnd }),
  )

  // Recent notes (last 5)
  const recentNotes = activeNotes
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5)

  // Mock data for writing streak and goals
  const writingStreak = 7 // Example: fetch from backend or calculate
  const weeklyGoal = 10
  const weeklyProgress = (thisWeekNotes.length / weeklyGoal) * 100

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {getGreeting()}, {user?.firstName}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Ready to capture your thoughts and ideas today?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{xs:12, sm:6, md:3}}>
          <StatCard
            title="Total Notes"
            value={activeNotes.length}
            icon={<Description />}
            color={theme.palette.primary.main}
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
                    {Math.round(weeklyProgress)}%
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
                  {recentNotes.map((note, index) => (
                    <React.Fragment key={note.id}>
                      <ListItem
                        sx={{
                          cursor: "pointer",
                          borderRadius: 2,
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                          py: 1.5,
                        }}
                        onClick={() => navigate(`/app/notes/view/${note.id}`)}
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
                              {note.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {note.synopsis}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Last updated: {formatDistanceToNow(new Date(note.lastUpdated))} ago
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/app/notes/view/${note.id}`)
                            }}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/app/notes/edit/${note.id}`)
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
                    {
                      notes.filter(
                        (note) => format(new Date(note.dateCreated), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
                      ).length
                    }{" "}
                    notes created today.
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
                    Historically, your most active day is **Monday**.
                  </Typography>
                </Box>

                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Star color="warning" />
                    <Typography variant="body1" fontWeight={500}>
                      Favorite Category
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    You write most about **Personal** notes.
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
