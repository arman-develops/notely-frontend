import { Box, Typography, Button, Avatar } from "@mui/material";
import { Celebration, StickyNote2 } from "@mui/icons-material";

type User = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

type WelcomeStepProps = {
  user: User | null;
  onNext: () => void;
};

export default function WelcomeStep({ user, onNext }: WelcomeStepProps) {
  return (
    <Box textAlign="center" py={4}>
      <Box mb={3}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
          }}
        >
          <StickyNote2 sx={{ fontSize: 40 }} />
        </Avatar>
        <Celebration
          sx={{
            fontSize: 60,
            color: "#f59e0b",
            animation: "bounce 2s infinite",
            "@keyframes bounce": {
              "0%, 20%, 50%, 80%, 100%": {
                transform: "translateY(0)",
              },
              "40%": {
                transform: "translateY(-10px)",
              },
              "60%": {
                transform: "translateY(-5px)",
              },
            },
          }}
        />
      </Box>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
        }}
      >
        Welcome to Notely, {user?.firstName}! 🎉
      </Typography>

      <Typography variant="h6" color="text.secondary" paragraph>
        We're thrilled to have you join our community of note-takers and idea
        organizers!
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        paragraph
        sx={{ maxWidth: 400, mx: "auto" }}
      >
        Let's take a few moments to set up your profile and personalize your
        Notely experience. This will help us tailor the app to your unique
        note-taking style.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onNext}
        sx={{
          mt: 3,
          px: 4,
          py: 1.5,
          background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
          "&:hover": {
            background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
          },
        }}
      >
        Let's Get Started!
      </Button>
    </Box>
  );
}
