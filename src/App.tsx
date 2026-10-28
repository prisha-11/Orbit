import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, PaletteMode, Box } from '@mui/material';

import Dashboard from './pages/Dashboard';
import CaptureOpportunity from './pages/CaptureOpportunity';
import OpportunitiesList from './pages/OpportunitiesList';
import ApplicationTracker from './pages/ApplicationTracker';
import DeadlineCalendar from './pages/DeadlineCalendar';
import StudentProfilePage from './pages/StudentProfilePage';
import SettingsPage from './pages/SettingsPage';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: React.FC = () => {
  // Light / dark mode handling with persistent local storage
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('orbit_theme_mode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('orbit_theme_mode', next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6A1B9A',
            light: '#9C4DCC',
            dark: '#4A148C',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#9575CD',
            light: '#B39DDB',
            dark: '#512DA8',
            contrastText: '#FFFFFF',
          },
          background: {
            default: mode === 'light' ? '#F4F5FA' : '#141320',
            paper: mode === 'light' ? '#FFFFFF' : '#1E1B2E',
          },
          text: {
            primary: mode === 'light' ? '#2E2840' : '#EAE7F2',
            secondary: mode === 'light' ? '#756F86' : '#A29BB8',
          },
          divider: mode === 'light' ? 'rgba(76, 78, 100, 0.12)' : 'rgba(255, 255, 255, 0.1)',
        },
        shape: {
          borderRadius: 10,
        },
        typography: {
          fontFamily: 'Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow:
                  mode === 'light'
                    ? '0px 2px 10px rgba(76, 78, 100, 0.06)'
                    : '0px 2px 10px rgba(0, 0, 0, 0.35)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Header darkMode={mode === 'dark'} onToggleDarkMode={toggleMode} />
            <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, overflowY: 'auto', flexGrow: 1, bgcolor: 'background.default' }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/capture" element={<CaptureOpportunity />} />
                <Route path="/opportunities" element={<OpportunitiesList initialType="All" />} />
                <Route path="/internships" element={<OpportunitiesList initialType="Internship" />} />
                <Route path="/hackathons" element={<OpportunitiesList initialType="Hackathon" />} />
                <Route path="/conferences" element={<OpportunitiesList initialType="Conference" />} />
                <Route path="/networking" element={<OpportunitiesList initialType="Networking" />} />
                <Route path="/saved" element={<OpportunitiesList savedOnly={true} />} />
                <Route path="/tracker" element={<ApplicationTracker />} />
                <Route path="/calendar" element={<DeadlineCalendar />} />
                <Route path="/profile" element={<StudentProfilePage />} />
                <Route path="/sources" element={<SettingsPage />} />
                <Route path="/email" element={<SettingsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate replace to="/dashboard" />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
