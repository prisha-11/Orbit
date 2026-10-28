import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { saveOpportunities, saveProfile } from '../utils/localStorage';
import sampleOpportunities from '../data/sampleOpportunities';
import sampleProfile from '../data/sampleProfile';

const SettingsPage: React.FC = () => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [eligibilityAlerts, setEligibilityAlerts] = useState(true);
  const [autoSaveCapture, setAutoSaveCapture] = useState(false);

  const handleResetData = () => {
    saveOpportunities(sampleOpportunities);
    saveProfile(sampleProfile);
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your opportunity channels, notification preferences, and application data
        </Typography>
      </Box>

      {resetSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Sample data restored successfully! Reloading...
        </Alert>
      )}

      {/* Connected Opportunity Sources */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <HubIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Connected Opportunity Channels
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage the platforms from which Orbit extracts internships, hackathons, and conferences.
          </Typography>

          <Stack spacing={2}>
            {[
              { name: 'College TPO Email Feed', desc: 'Auto-ingest announcements forwarded from placement coordinators', active: true },
              { name: 'Unstop Opportunity Webhook', desc: 'Real-time hackathon & national competition announcements', active: true },
              { name: 'LinkedIn Posts & Articles', desc: 'Sync recruiter posts and verified hiring announcements', active: true },
              { name: 'Internshala Sync', desc: 'Curated summer internship and pre-placement listings', active: true },
              { name: 'Instagram & Social Announcements', desc: 'Direct paste capture support', active: false },
            ].map((channel, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {channel.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {channel.desc}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch defaultChecked={channel.active} color="primary" />}
                  label={channel.active ? 'Active' : 'Manual'}
                />
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Notification & Intelligence Preferences */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <NotificationsActiveOutlinedIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Opportunity Intelligence Preferences
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure deadline urgency threshold reminders and match scoring alerts.
          </Typography>

          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Urgent Deadline Reminders
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Flag opportunities with deadlines approaching within 7 days
                </Typography>
              </Box>
              <Switch checked={deadlineReminders} onChange={(e) => setDeadlineReminders(e.target.checked)} color="primary" />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Eligibility Verification Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Highlight eligibility changes when degree or year criteria match your profile
                </Typography>
              </Box>
              <Switch checked={eligibilityAlerts} onChange={(e) => setEligibilityAlerts(e.target.checked)} color="primary" />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Auto-Save Captured Opportunities
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically persist newly extracted announcements to the dashboard feed
                </Typography>
              </Box>
              <Switch checked={autoSaveCapture} onChange={(e) => setAutoSaveCapture(e.target.checked)} color="primary" />
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Reset & Storage */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
            Data Persistence & Reset
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Orbit persists all captured announcements, student profile details, and application statuses in your browser's localStorage.
          </Typography>

          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={handleResetData}
            sx={{ borderRadius: 2 }}
          >
            Reset to Default Demo Opportunities
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
