import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  InputBase,
  Badge,
  Tooltip,
  Avatar,
  Box,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const isNotifOpen = Boolean(notificationAnchor);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotificationAnchor(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: 3, display: 'flex', justifyContent: 'space-between' }}>
        {/* Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F4F5FA'),
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            flexGrow: 1,
            maxWidth: 480,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Search opportunities, companies, conferences…"
            sx={{ flex: 1, fontSize: '0.875rem' }}
            inputProps={{ 'aria-label': 'search' }}
          />
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'background.paper',
              px: 0.8,
              py: 0.2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          >
            Ctrl + K
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} size="small" aria-label="Refresh Dashboard" sx={{ color: 'text.secondary' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={onToggleDarkMode} size="small" aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} sx={{ color: 'text.secondary' }}>
              {darkMode ? <LightModeIcon fontSize="small" sx={{ color: '#FFB74D' }} /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton onClick={handleNotifClick} size="small" aria-label="Notifications" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={3} color="primary">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile Avatar */}
          <Tooltip title="Alex Morgan (Click to view Profile & Account)">
            <Button
              onClick={handleProfileClick}
              aria-label="User Profile and Account Menu"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 2,
                textTransform: 'none',
                color: 'inherit',
                transition: 'background 0.2s',
                '&:hover': {
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: 'primary.main',
                  background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                AM
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', mr: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                  Alex Morgan
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                  B.Tech CS • 3rd Year
                </Typography>
              </Box>
            </Button>
          </Tooltip>
        </Box>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 230,
              mt: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Alex Morgan
            </Typography>
            <Typography variant="caption" color="text.secondary">
              alex.morgan@university.edu
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => handleMenuItemClick('/profile')}>
            <ListItemIcon>
              <PersonOutlineIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Eligibility Profile" secondary="View & edit skills" />
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/saved')}>
            <ListItemIcon>
              <BookmarkBorderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Saved Opportunities" />
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/tracker')}>
            <ListItemIcon>
              <AssignmentTurnedInIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Application Tracker" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleMenuItemClick('/settings')}>
            <ListItemIcon>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </MenuItem>
        </Menu>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notificationAnchor}
          open={isNotifOpen}
          onClose={handleNotifClose}
          PaperProps={{
            elevation: 3,
            sx: { width: 320, mt: 1.5, borderRadius: 2, p: 1 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Typography variant="subtitle2" sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
            Notifications (3)
          </Typography>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Google Summer Internship</Typography>
              <Typography variant="caption" color="error">Deadline approaching in 3 days!</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>ETHGlobal Hackathon</Typography>
              <Typography variant="caption" color="text.secondary">Registration confirmed for next weekend.</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>TPO Announcement</Typography>
              <Typography variant="caption" color="text.secondary">New placement drive posted for 3rd/4th years.</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
