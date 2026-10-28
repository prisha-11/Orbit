import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Chip,
  Alert,
  Divider,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import KeyIcon from '@mui/icons-material/Key';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { saveOpportunities, saveProfile } from '../utils/localStorage';
import sampleOpportunities from '../data/sampleOpportunities';
import sampleProfile from '../data/sampleProfile';

const SettingsPage: React.FC = () => {
  const [resetSuccess, setResetSuccess] = useState(false);

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
          System Settings & Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage AI extraction keys, connected data sources, and application storage
        </Typography>
      </Box>

      {resetSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Sample data restored successfully! Reloading...
        </Alert>
      )}

      {/* AI Extraction Engine Status */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <KeyIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                AI Model & API Configuration
              </Typography>
            </Box>
            <Chip label="Gemini 2.5 Flash Active" color="success" size="small" sx={{ fontWeight: 700 }} />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your Google Gemini API Key and OpenAI fallback keys are securely loaded from <code>.env.local</code> on the backend proxy server to prevent exposing credentials to client-side bundles.
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F9F9FB', mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Active Configuration:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              Primary Engine: Google Gemini (gemini-2.5-flash / gemini-1.5-flash JSON mode)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              Fallback Engine: OpenAI GPT-4o
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              Key Status: GEMINI_API_KEY active in .env.local
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {/* Connected Opportunity Sources */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
              { name: 'College TPO Email Feed', desc: 'Auto-ingest emails forwarded from placement coordinators', active: true },
              { name: 'Unstop Opportunity Webhook', desc: 'Real-time hackathon & competition announcements', active: true },
              { name: 'LinkedIn Posts & Articles', desc: 'Sync recruiter posts and hiring announcements', active: true },
              { name: 'Internshala Sync', desc: 'Early bird summer internship listings', active: true },
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
                  control={<Switch checked={channel.active} color="primary" />}
                  label={channel.active ? 'Active' : 'Manual'}
                />
              </Paper>
            ))}
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
            Orbit persists all captured announcements, student profiles, and application statuses in your browser's localStorage.
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
