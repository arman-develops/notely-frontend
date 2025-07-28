import type React from "react"

import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon, // Renamed to avoid conflict with page component
  Add,
  Description,
  PushPin,
  Bookmark,
  Delete,
  Person,
  Logout,
  Close,
  Search,
  Notifications,
  Settings,
  TrendingUp,
} from "@mui/icons-material"
import { useAuthStore } from "../store/AuthStore"
import { useNotesStore } from "../store/NotesStore"

const drawerWidth = 280

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: DashboardIcon, // Using renamed icon
    path: "/app/dashboard",
    description: "Overview and stats",
  },
  {
    id: "new",
    label: "New Entry",
    icon: Add,
    path: "/app/notes/new",
    description: "Create a new note",
    highlight: true,
  },
  {
    id: "all",
    label: "All Entries",
    icon: Description,
    path: "/app/notes",
    description: "View all your notes",
  },
  {
    id: "pinned",
    label: "Pinned",
    icon: PushPin,
    path: "/app/notes/pinned",
    description: "Important notes",
  },
  {
    id: "bookmarked",
    label: "Bookmarked",
    icon: Bookmark,
    path: "/app/notes/bookmarked",
    description: "Saved for later",
  },
  {
    id: "trash",
    label: "Trash",
    icon: Delete,
    path: "/app/notes/trash",
    description: "Deleted notes",
  },
]

export default function DashboardLayout() {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { notes } = useNotesStore()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Calculate stats for badges
  const activeNotes = notes.filter((note) => !note.isDeleted)
  const pinnedCount = notes.filter((note) => !note.isDeleted && note.isPinned).length
  const bookmarkedCount = notes.filter((note) => !note.isDeleted && note.isBookmarked).length
  const trashCount = notes.filter((note) => note.isDeleted).length

  const getBadgeCount = (itemId: string) => {
    switch (itemId) {
      case "all":
        return activeNotes.length
      case "pinned":
        return pinnedCount
      case "bookmarked":
        return bookmarkedCount
      case "trash":
        return trashCount
      default:
        return 0
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
    handleProfileMenuClose()
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <List sx={{ "& .MuiListItem-root": { mb: 1 } }}>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            const badgeCount = getBadgeCount(item.id)

            return (
              <ListItem key={item.id} disablePadding>
                <Tooltip title={item.description} placement="right" arrow>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 4,
                      minHeight: 56,
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.12)
                        : item.highlight
                          ? alpha(theme.palette.success.main, 0.08)
                          : "transparent",
                      border: isActive
                        ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                        : item.highlight
                          ? `2px solid ${alpha(theme.palette.success.main, 0.2)}`
                          : "2px solid transparent",
                      color: isActive
                        ? theme.palette.primary.main
                        : item.highlight
                          ? theme.palette.success.main
                          : theme.palette.text.primary,
                      "&:hover": {
                        backgroundColor: isActive
                          ? alpha(theme.palette.primary.main, 0.16)
                          : item.highlight
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.action.hover, 0.08),
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "inherit",
                        minWidth: 44,
                      }}
                    >
                      {badgeCount > 0 && item.id !== "new" ? (
                        <Badge badgeContent={badgeCount} color={item.id === "trash" ? "error" : "primary"} max={99}>
                          <Icon />
                        </Badge>
                      ) : (
                        <Icon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={isActive ? item.description : undefined}
                      slotProps={{
                        primary: {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.95rem",
                        },
                        secondary: {
                          fontSize: "0.75rem",
                          sx: { mt: 0.5 },
                        }
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <List>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation("/app/profile")}
              sx={{
                borderRadius: 2,
                backgroundColor:
                  location.pathname === "/app/profile" ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                color: location.pathname === "/app/profile" ? theme.palette.primary.main : theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography variant="h6" fontWeight={600}>
                {navigationItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {navigationItems.find((item) => item.path === location.pathname)?.description || "Welcome back"}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Search">
              <IconButton color="inherit">
                <Search />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton color="inherit">
                <Settings />
              </IconButton>
            </Tooltip>

            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                }}
              >
                {!user?.avatar && getInitials(user?.firstName, user?.lastName)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={handleDrawerToggle}>
              <Close />
            </IconButton>
          </Box>
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "80px",
          backgroundColor: theme.palette.background.default,
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Outlet />
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <MenuItem onClick={() => navigate("/app/profile")} sx={{ py: 1.5 }}>
          <Person sx={{ mr: 2 }} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => navigate("/app/analytics")} sx={{ py: 1.5 }}>
          <TrendingUp sx={{ mr: 2 }} />
          Analytics
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
          <Logout sx={{ mr: 2 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  )
}
