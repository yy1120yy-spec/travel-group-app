'use client';

import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showNotifications?: boolean;
}

export default function Header({
  title = '여행메이트',
  onMenuClick,
  showNotifications = false,
}: HeaderProps) {
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        {showNotifications && (
          <IconButton color="inherit" aria-label="notifications">
            <NotificationsIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}
