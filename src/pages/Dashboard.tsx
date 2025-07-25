import { Box, Typography, Container } from "@mui/material"
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

        <Box>
          {/* Notes list will go here */}
          <Typography variant="h6">Your Notes</Typography>
          <Typography variant="h1" align="center">Coming soon</Typography>
        </Box>
      </Container>
    </Box>
  )
}
