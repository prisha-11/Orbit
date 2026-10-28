import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HubIcon from '@mui/icons-material/Hub';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import { Opportunity, StudentProfile } from '../types';
import { loadOpportunities, saveOpportunities, loadProfile, saveProfile } from '../utils/localStorage';
import sampleOpps from '../data/sampleOpportunities';
import sampleProfile from '../data/sampleProfile';

const Dashboard: React.FC = () => {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  // Initialize storage with sample data if empty
  useEffect(() => {
    const storedOpps = loadOpportunities();
    if (storedOpps.length === 0) {
      saveOpportunities(sampleOpps);
      setOpps(sampleOpps);
    } else {
      setOpps(storedOpps);
    }
    const storedProfile = loadProfile();
    if (!storedProfile) {
      saveProfile(sampleProfile);
      setProfile(sampleProfile);
    } else {
      setProfile(storedProfile);
    }
  }, []);

  const handleToggleSave = (id: string) => {
    const updated = opps.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === 'Saved' ? 'To Apply' : 'Saved';
        return { ...o, status: nextStatus };
      }
      return o;
    });
    setOpps(updated);
    saveOpportunities(updated);
  };

  // Helper to get nearest deadline
  const nearestDeadline = opps
    .filter(o => o.deadline)
    .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime())[0];

  // Helper to get top priority (eligible + soonest deadline)
  const priorityOpps = opps
    .filter(o => o.eligibility === 'Eligible' || o.eligibility === 'Potentially Eligible')
    .sort((a, b) => {
      const dA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dA - dB;
    })
    .slice(0, 4);

  // Helper for recommended (matchScore >= 70)
  const recommended = opps
    .filter(o => (o.matchScore ?? 0) >= 65)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, 4);

  // Filtered opportunities for feed
  const displayOpps = filterType === 'All' ? opps : opps.filter(o => o.type === filterType);

  // Application tracker counts
  const trackerStats = {
    Saved: opps.filter(o => o.status === 'Saved' || o.verificationStatus === 'Verified').length,
    'To Apply': opps.filter(o => o.eligibility === 'Eligible').length,
    Applied: opps.filter(o => o.status === 'Applied').length,
    Shortlisted: opps.filter(o => o.status === 'Shortlisted').length,
    Accepted: opps.filter(o => o.status === 'Accepted').length,
  };

  const getEligibilityColor = (elig?: string) => {
    switch (elig) {
      case 'Eligible':
        return 'success';
      case 'Potentially Eligible':
        return 'warning';
      case 'Ineligible':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Welcome Banner Card (Materio Style) */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #2D144A 0%, #1A1326 100%)'
                  : 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)',
              border: '1px solid',
              borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(106, 27, 154, 0.4)' : '#E9D5FF'),
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box sx={{ maxWidth: '65%' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Opportunity Intelligence Hub
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 1, color: 'text.primary' }}>
                  Welcome back, {profile?.degree || 'Student'} Explorer!
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.5 }}>
                  Orbit has matched <strong>{opps.length} active opportunities</strong> against your profile (
                  {profile?.branch || 'Computer Science'}, Year {profile?.year || 3}).
                </Typography>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/capture"
                    startIcon={<AddIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                      color: '#fff',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(106, 27, 154, 0.35)',
                    }}
                  >
                    Capture Opportunity
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/tracker"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    View Tracker
                  </Button>
                </Stack>
              </Box>

              {/* Decorative Trophy Icon Box */}
              <Box
                sx={{
                  position: 'absolute',
                  right: 24,
                  bottom: 24,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(106, 27, 154, 0.15) 0%, rgba(149, 117, 205, 0.25) 100%)',
                }}
              >
                <Typography sx={{ fontSize: '3.5rem' }}>🎯</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Highest Priority Deadline Card */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', borderRadius: 3, position: 'relative' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Nearest Urgent Deadline
                </Typography>
                <Chip label="High Priority" color="error" size="small" sx={{ fontWeight: 700, height: 22 }} />
              </Box>

              {nearestDeadline ? (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                    {nearestDeadline.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {nearestDeadline.organization} • {nearestDeadline.type}
                  </Typography>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      mb: 2.5,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.08)' : '#FFF8E1',
                      borderColor: '#FFE082',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon fontSize="small" sx={{ color: '#F57C00' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#F57C00' }}>
                        Due: {new Date(nearestDeadline.deadline as string).toLocaleDateString(undefined, { dateStyle: 'full' })}
                      </Typography>
                    </Box>
                  </Paper>

                  <Button
                    variant="contained"
                    fullWidth
                    component={Link}
                    to="/capture"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Inspect Opportunity
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending deadlines detected yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 4 Metric Summary Tiles (Transactions style from Materio) */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(76, 175, 80, 0.12)',
                  color: '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WorkOutlineIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Eligible Internships
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {opps.filter(o => o.type === 'Internship' && (o.eligibility === 'Eligible' || o.eligibility === 'Potentially Eligible')).length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(106, 27, 154, 0.12)',
                  color: '#6A1B9A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmojiEventsIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active Hackathons
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {opps.filter(o => o.type === 'Hackathon').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(255, 152, 0, 0.12)',
                  color: '#ED6C02',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarMonthIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Upcoming Deadlines
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {opps.filter(o => o.deadline).length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(33, 150, 243, 0.12)',
                  color: '#1976D2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Research & Conferences
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {opps.filter(o => o.type === 'Conference' || o.type === 'Research').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Opportunities Card */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Priority Opportunities
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sorted by eligibility and imminent deadline
                  </Typography>
                </Box>
                <Button component={Link} to="/opportunities" size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                  View All ({opps.length})
                </Button>
              </Box>

              <Stack spacing={2}>
                {priorityOpps.map(o => (
                  <Paper
                    key={o.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      transition: 'border 0.2s',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ minWidth: 220 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                        <Chip label={o.type} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        <Chip
                          label={o.eligibility}
                          size="small"
                          color={getEligibilityColor(o.eligibility) as any}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {o.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {o.organization} • {o.source}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          Deadline
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {o.deadline ? new Date(o.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                        </Typography>
                      </Box>

                      <Tooltip title={o.status === 'Saved' ? 'Saved' : 'Save opportunity'}>
                        <IconButton size="small" onClick={() => handleToggleSave(o.id)} color={o.status === 'Saved' ? 'primary' : 'default'}>
                          {o.status === 'Saved' ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to="/capture"
                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                      >
                        Inspect
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended For You Card */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Recommended For You
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    AI profile & aspirational alignment
                  </Typography>
                </Box>
                <Chip
                  icon={<TrendingUpIcon fontSize="small" />}
                  label="Aspirational"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>

              <Stack spacing={2}>
                {recommended.map(o => (
                  <Paper
                    key={o.id}
                    variant="outlined"
                    sx={{
                      p: 1.8,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {o.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {o.organization} • {o.type}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {o.skillsRequired.slice(0, 3).map((s, i) => (
                          <Chip key={i} label={s} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {o.matchScore ?? 75}%
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                        Match
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Tracker Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Application Tracker Summary
                </Typography>
                <Button component={Link} to="/tracker" size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                  Open Full Board
                </Button>
              </Box>

              <Grid container spacing={1.5}>
                {Object.entries(trackerStats).map(([status, count]) => (
                  <Grid item xs={6} sm={4} key={status}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FAFAFC',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {status}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'primary.main' }}>
                        {count}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Connected Sources Card with Add Opportunity Link */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Connected Sources
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monitored college & external opportunity channels
                  </Typography>
                </Box>
                <HubIcon color="action" />
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {[
                  { name: 'College TPO Email', active: true, badge: 'Integrated' },
                  { name: 'Unstop', active: true, badge: 'Active' },
                  { name: 'LinkedIn Posts', active: true, badge: 'Active' },
                  { name: 'Internshala', active: true, badge: 'Active' },
                  { name: 'Instagram Announcements', active: false, badge: 'Manual Paste' },
                  { name: 'Conference Websites', active: false, badge: 'Manual Paste' },
                ].map((src, i) => (
                  <Grid item xs={6} key={i}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {src.name}
                      </Typography>
                      <Chip
                        label={src.badge}
                        size="small"
                        color={src.active ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/capture"
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                  color: '#fff',
                  borderRadius: 2,
                  py: 1.2,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(106, 27, 154, 0.35)',
                }}
              >
                Add / Capture Opportunity
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
