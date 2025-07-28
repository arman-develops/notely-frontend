import { Box, Typography } from "@mui/material"

export default function DashboardHeader() {
    return (
        <Box
        sx={{
            p: 3,
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
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                Notely
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your digital sanctuary
                </Typography>
            </Box>
        </Box>
    )
}