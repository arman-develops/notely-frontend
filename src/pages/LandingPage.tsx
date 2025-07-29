import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Slide,
} from "@mui/material"
import {
  StickyNote2,
  Create,
  Search,
  Cloud,
  Security,
  Speed,
  Star,
  ArrowForward,
  PlayArrow,
  BookmarkBorder,
  PushPin,
} from "@mui/icons-material"

const features = [
  {
    icon: Create,
    title: "Rich Text Editor",
    description: "Write with Markdown support, syntax highlighting, and real-time preview",
    color: "#6366f1",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find your notes instantly with powerful search and filtering capabilities",
    color: "#8b5cf6",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Access your notes anywhere, anytime with seamless cloud synchronization",
    color: "#06b6d4",
  },
  {
    icon: Security,
    title: "Secure & Private",
    description: "Your thoughts are protected with enterprise-grade security",
    color: "#10b981",
  },
  {
    icon: BookmarkBorder,
    title: "Smart Organization",
    description: "Pin, bookmark, and categorize your notes for easy access",
    color: "#f59e0b",
  },
  {
    icon: Speed,
    title: "Lightning Fast",
    description: "Optimized performance for seamless note-taking experience",
    color: "#ef4444",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "/placeholder.svg?height=60&width=60",
    content: "Notely has transformed how I organize my ideas. The interface is beautiful and intuitive!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    avatar: "/placeholder.svg?height=60&width=60",
    content: "The Markdown support and code highlighting make it perfect for technical documentation.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    avatar: "/placeholder.svg?height=60&width=60",
    content: "I love how I can access my notes from anywhere. Perfect for my study sessions!",
    rating: 5,
  },
]

const stats = [
  { number: "50K+", label: "Active Users" },
  { number: "1M+", label: "Notes Created" },
  { number: "99.9%", label: "Uptime" },
  { number: "4.9/5", label: "User Rating" },
]

export default function LandingPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Navigation */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  width: 40,
                  height: 40,
                }}
              >
                <StickyNote2 />
              </Avatar>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Notely
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          pt: 12,
          pb: 8,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{xs:12, md:6}}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      fontWeight: 800,
                      mb: 3,
                      lineHeight: 1.2,
                    }}
                  >
                    Your Digital
                    <br />
                    <span
                      style={{
                        background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Sanctuary
                    </span>
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                    Capture, organize, and access your thoughts with the most beautiful and intuitive note-taking
                    experience ever created.
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/signup")}
                      sx={{
                        py: 2,
                        px: 4,
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        background: "linear-gradient(45deg, #10b981, #059669)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #059669, #047857)",
                        },
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Start Writing Today
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        py: 2,
                        px: 4,
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        borderColor: "white",
                        color: "white",
                        "&:hover": {
                          borderColor: "white",
                          backgroundColor: alpha("#ffffff", 0.1),
                        },
                      }}
                      startIcon={<PlayArrow />}
                    >
                      Watch Demo
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <Slide direction="left" in timeout={1200}>
                <Box
                  sx={{
                    position: "relative",
                    transform: "perspective(1000px) rotateY(-15deg) rotateX(10deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <Card
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "#ef4444",
                        }}
                      />
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "#f59e0b",
                        }}
                      />
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "#10b981",
                        }}
                      />
                    </Box>
                    <Typography variant="h6" color="text.primary" fontWeight={600} mb={2}>
                      My Ideas & Thoughts
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                      # Project Planning
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Today I had an amazing idea for a new feature that could revolutionize how we think about...
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip size="small" label="Ideas" color="primary" />
                      <Chip size="small" label="Planning" />
                      <IconButton size="small" color="primary">
                        <PushPin fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: "background.paper" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid size={{xs:6, md:3}} key={index}>
                <Box textAlign="center">
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, backgroundColor: "background.default" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h2" fontWeight={700} gutterBottom>
              Everything you need to
              <br />
              <span
                style={{
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                organize your thoughts
              </span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Powerful features designed to make note-taking effortless and enjoyable
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Grid size={{xs:12, md:6, lg:4}} key={index}>
                  <Card
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 4,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: theme.shadows[12],
                      },
                      border: `1px solid ${alpha(feature.color, 0.1)}`,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mb: 3,
                        backgroundColor: alpha(feature.color, 0.1),
                        color: feature.color,
                      }}
                    >
                      <Icon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, backgroundColor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h2" fontWeight={700} gutterBottom>
              Loved by thousands
            </Typography>
            <Typography variant="h6" color="text.secondary">
              See what our users are saying about Notely
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{xs:12, md:4}} key={index}>
                <Card
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 4,
                    position: "relative",
                    "&::before": {
                      content: "''",
                      position: "absolute",
                      top: 16,
                      left: 16,
                      fontSize: "4rem",
                      color: alpha(theme.palette.primary.main, 0.1),
                      fontFamily: "serif",
                    },
                  }}
                >
                  <Box display="flex" gap={0.5} mb={3}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: "#fbbf24", fontSize: 20 }} />
                    ))}
                  </Box>
                  <Typography variant="body1" mb={3} fontStyle="italic" lineHeight={1.7}>
                    {testimonial.content}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={testimonial.avatar} sx={{ width: 48, height: 48 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Ready to transform your
            <br />
            note-taking experience?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who have already discovered the joy of organized thinking
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/signup")}
            sx={{
              py: 2,
              px: 6,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1.2rem",
              background: "linear-gradient(45deg, #10b981, #059669)",
              "&:hover": {
                background: "linear-gradient(45deg, #059669, #047857)",
              },
            }}
            endIcon={<ArrowForward />}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: "background.paper", borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{xs:12, md:6}}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar
                  sx={{
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    width: 32,
                    height: 32,
                  }}
                >
                  <StickyNote2 />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>
                  Notely
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Your digital sanctuary for thoughts, ideas, and inspiration.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © 2024 Notely. All rights reserved.
              </Typography>
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }} gap={4}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Product
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Features
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Pricing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updates
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={2}>
                    Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Help Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Contact Us
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Privacy Policy
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}
