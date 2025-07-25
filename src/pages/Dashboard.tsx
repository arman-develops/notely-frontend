import { Box, Typography, Card, CardContent, Button, Container } from "@mui/material"
import { Add, StickyNote2 } from "@mui/icons-material"
import { useAuthStore } from "../store/AuthStore"

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to capture your thoughts and ideas?
          </Typography>
        </Box>

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
              <StickyNote2
                sx={{
                  fontSize: 80,
                  color: "primary.light",
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom color="text.secondary">
                You don't have any notes yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Start your note-taking journey by creating your first note!
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
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
          <Box>
            {/* Notes list will go here */}
            <Typography variant="h6">Your Notes</Typography>
            <Typography variant="h1">Coming soon</Typography>
          </Box>
      </Container>
    </Box>
  )
}
