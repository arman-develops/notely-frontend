import { Box, Typography, Avatar } from "@mui/material"

export default function UserInfo({user, getInitials, theme}: any) {
    return (
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                src={user?.avatar}
                sx={{
                    width: 48,
                    height: 48,
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                }}
                >
                {!user?.avatar && getInitials(user?.firstName, user?.lastName)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                    @{user?.username}
                </Typography>
                </Box>
            </Box>
        </Box>
    )
}