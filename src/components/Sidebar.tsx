import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HubIcon from '@mui/icons-material/Hub';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const mainItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { to: '/capture', label: 'Capture with AI', icon: <AddCircleOutlineIcon fontSize="small" />, badge: 1, badgeColor: 'secondary' },
  { to: '/opportunities', label: 'All Opportunities', icon: <WorkOutlineIcon fontSize="small" />, badge: 14, badgeColor: 'primary' },
  { to: '/internships', label: 'Internships', icon: <WorkOutlineIcon fontSize="small" /> },
  { to: '/hackathons', label: 'Hackathons', icon: <EmojiEventsIcon fontSize="small" /> },
  { to: '/conferences', label: 'Conferences & Research', icon: <SchoolIcon fontSize="small" /> },
  { to: '/networking', label: 'Networking Events', icon: <PeopleIcon fontSize="small" /> },
];

const manageItems: NavItem[] = [
  { to: '/saved', label: 'Saved Opportunities', icon: <BookmarkBorderIcon fontSize="small" /> },
  { to: '/tracker', label: 'Application Tracker', icon: <AssignmentTurnedInIcon fontSize="small" /> },
  { to: '/calendar', label: 'Deadline Calendar', icon: <CalendarMonthIcon fontSize="small" /> },
  { to: '/profile', label: 'Eligibility Profile', icon: <AccountCircleIcon fontSize="small" /> },
];

const settingsItems: NavItem[] = [
  { to: '/sources', label: 'Connected Sources', icon: <HubIcon fontSize="small" /> },
  { to: '/email', label: 'Email Imports', icon: <EmailOutlinedIcon fontSize="small" /> },
  { to: '/settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
];

const Sidebar: React.FC = () => {
  const renderItem = (item: NavItem) => (
    <ListItemButton
      key={item.to}
      component={NavLink}
      to={item.to}
      sx={{
        borderRadius: 2,
        mb: 0.6,
        mx: 1.2,
        py: 1,
        px: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(106, 27, 154, 0.08)'),
        },
      }}
      style={({ isActive }) => ({
        background: isActive ? 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)' : undefined,
        color: isActive ? '#FFFFFF' : 'inherit',
        boxShadow: isActive ? '0px 4px 12px rgba(106, 27, 154, 0.35)' : undefined,
      })}
    >
      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
      <ListItemText
        primary={item.label}
        primaryTypographyProps={{
          fontSize: '0.86rem',
          fontWeight: 500,
        }}
      />
      {item.badge !== undefined && (
        <Badge
          badgeContent={item.badge}
          color={item.badgeColor || 'primary'}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              height: 18,
              minWidth: 18,
            },
          }}
        />
      )}
    </ListItemButton>
  );

  return (
    <Box
      component="nav"
      aria-label="Main Navigation"
      sx={{
        width: 260,
        flexShrink: 0,
        bgcolor: 'background.paper',
        color: 'text.primary',
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Logo & Wordmark */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(106, 27, 154, 0.3)',
          }}
        >
          ◎
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.15rem',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Orbit
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Opportunity Radar
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Sections */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5 }}>
        <Typography variant="caption" sx={{ px: 2.5, py: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
          Main
        </Typography>
        <List disablePadding>{mainItems.map(renderItem)}</List>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="caption" sx={{ px: 2.5, py: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
          Manage
        </Typography>
        <List disablePadding>{manageItems.map(renderItem)}</List>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="caption" sx={{ px: 2.5, py: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
          Sources & Settings
        </Typography>
        <List disablePadding>{settingsItems.map(renderItem)}</List>
      </Box>

      {/* Materio Style Bottom User Badge */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#4CAF50',
              boxShadow: '0 0 6px #4CAF50',
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Gemini AI Engine: <strong>Active</strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
