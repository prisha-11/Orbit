import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { Opportunity } from '../types';
import { loadOpportunities, saveOpportunities } from '../utils/localStorage';
import sampleOpps from '../data/sampleOpportunities';

const STAGES: Array<'Saved' | 'To Apply' | 'Applied' | 'Shortlisted' | 'Accepted' | 'Closed'> = [
  'Saved',
  'To Apply',
  'Applied',
  'Shortlisted',
  'Accepted',
  'Closed',
];

const ApplicationTracker: React.FC = () => {
  const [opps, setOpps] = useState<Opportunity[]>([]);

  useEffect(() => {
    let stored = loadOpportunities();
    if (stored.length === 0) {
      saveOpportunities(sampleOpps);
      stored = sampleOpps;
    }
    // Default opportunities without explicit status to 'Saved' or 'To Apply'
    const normalized = stored.map(o => ({
      ...o,
      status: o.status || (o.eligibility === 'Eligible' ? 'To Apply' : 'Saved'),
    }));
    setOpps(normalized);
  }, []);

  const handleStatusChange = (id: string, newStatus: any) => {
    const updated = opps.map(o => (o.id === id ? { ...o, status: newStatus } : o));
    setOpps(updated);
    saveOpportunities(updated);
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Application Intelligence Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track status, interview shortlists, and accepted offers in one unified Kanban board
          </Typography>
        </Box>
        <Button
          variant="contained"
          component={Link}
          to="/capture"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
            color: '#fff',
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Add Opportunity
        </Button>
      </Box>

      {/* Kanban Board Columns */}
      <Grid container spacing={2}>
        {STAGES.map(stage => {
          const itemsInStage = opps.filter(o => o.status === stage);

          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={stage}>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  minHeight: 550,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F4F5FA',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    {stage}
                  </Typography>
                  <Chip
                    label={itemsInStage.length}
                    size="small"
                    color={itemsInStage.length > 0 ? 'primary' : 'default'}
                    sx={{ height: 20, minWidth: 20, fontWeight: 700 }}
                  />
                </Box>

                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                  {itemsInStage.map(opp => (
                    <Card key={opp.id} sx={{ borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                      <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Chip label={opp.type} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {opp.matchScore ?? 80}% match
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 0.5 }}>
                          {opp.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {opp.organization}
                        </Typography>

                        {opp.deadline && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.2 }}>
                            <CalendarMonthIcon fontSize="inherit" />
                            {new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Typography>
                        )}

                        <FormControl fullWidth size="small">
                          <Select
                            value={opp.status || stage}
                            onChange={(e) => handleStatusChange(opp.id, e.target.value)}
                            sx={{ height: 28, fontSize: '0.72rem' }}
                          >
                            {STAGES.map(s => (
                              <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
                                Move to {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {opp.applicationUrl && (
                          <Box sx={{ mt: 1, textAlign: 'right' }}>
                            <Button
                              size="small"
                              href={opp.applicationUrl}
                              target="_blank"
                              rel="noreferrer"
                              endIcon={<OpenInNewIcon fontSize="inherit" />}
                              sx={{ fontSize: '0.68rem', py: 0 }}
                            >
                              Apply
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {itemsInStage.length === 0 && (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', opacity: 0.6, fontSize: '0.75rem' }}>
                      No items
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ApplicationTracker;
