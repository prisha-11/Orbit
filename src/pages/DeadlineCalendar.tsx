import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Grid,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { Opportunity } from '../types';
import { loadOpportunities } from '../utils/localStorage';
import sampleOpps from '../data/sampleOpportunities';

const DeadlineCalendar: React.FC = () => {
  const [opps, setOpps] = useState<Opportunity[]>([]);

  useEffect(() => {
    const stored = loadOpportunities();
    setOpps(stored.length > 0 ? stored : sampleOpps);
  }, []);

  const now = new Date().getTime();
  const oneWeek = now + 7 * 24 * 60 * 60 * 1000;
  const oneMonth = now + 30 * 24 * 60 * 60 * 1000;

  const urgent = opps.filter(o => o.deadline && new Date(o.deadline).getTime() <= oneWeek);
  const thisMonth = opps.filter(o => o.deadline && new Date(o.deadline).getTime() > oneWeek && new Date(o.deadline).getTime() <= oneMonth);
  const laterOrFlexible = opps.filter(o => !o.deadline || new Date(o.deadline).getTime() > oneMonth);

  const renderSection = (title: string, items: Opportunity[], color: 'error' | 'warning' | 'primary') => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip label={items.length} color={color} size="small" sx={{ fontWeight: 800 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {items.map(opp => (
          <Grid item xs={12} md={6} lg={4} key={opp.id}>
            <Card sx={{ borderRadius: 2.5, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip label={opp.type} size="small" color="primary" sx={{ height: 20, fontSize: '0.68rem' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {opp.organization}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                  {opp.title}
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFF9E6',
                  }}
                >
                  <AccessTimeIcon fontSize="small" color="warning" />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {opp.deadline ? new Date(opp.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Flexible timeline'}
                  </Typography>
                </Paper>

                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  component={Link}
                  to="/capture"
                  endIcon={<ArrowForwardIcon fontSize="small" />}
                  sx={{ borderRadius: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {items.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              No deadlines in this category.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Deadline Intelligence Calendar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track registration deadlines, paper submission cutoffs, and application milestones
        </Typography>
      </Box>

      {renderSection('Urgent: Due Within 7 Days', urgent, 'error')}
      <Divider sx={{ my: 3 }} />
      {renderSection('Upcoming: Due Within 30 Days', thisMonth, 'warning')}
      <Divider sx={{ my: 3 }} />
      {renderSection('Later & Flexible Deadlines', laterOrFlexible, 'primary')}
    </Box>
  );
};

export default DeadlineCalendar;
