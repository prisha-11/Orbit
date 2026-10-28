import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  Grid,
  Button,
  Stack,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';

import { Opportunity } from '../types';
import { loadOpportunities, saveOpportunities } from '../utils/localStorage';
import { syncLiveWebOpportunities } from '../utils/webScraper';
import { formatDeadline, getEligibilityColor } from '../utils/formatters';

interface OpportunitiesListProps {
  initialType?: string;
  savedOnly?: boolean;
}

const matchesTypeFilter = (itemType: string, filter: string) => {
  const normFilter = (filter || '').toLowerCase().trim();
  const normItem = (itemType || '').toLowerCase().trim();
  if (normFilter === 'all' || !normFilter) return true;
  if (normFilter === 'conference' || normFilter === 'conferences' || normFilter === 'research') {
    return normItem.includes('conf') || normItem.includes('research') || normItem.includes('fellowship');
  }
  if (normFilter === 'internship' || normFilter === 'internships') {
    return normItem.includes('intern');
  }
  if (normFilter === 'hackathon' || normFilter === 'hackathons') {
    return normItem.includes('hack');
  }
  if (normFilter === 'networking' || normFilter === 'network') {
    return normItem.includes('net') || normItem.includes('meet') || normItem.includes('summit') || normItem.includes('mixer');
  }
  return normItem === normFilter;
};

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ initialType = 'All', savedOnly = false }) => {
  // Synchronous initialization ensures cards are visible immediately without any blank flicker
  const [opps, setOpps] = useState<Opportunity[]>(() => loadOpportunities());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    setTypeFilter(initialType);
  }, [initialType]);

  const refreshOpportunities = () => {
    const stored = loadOpportunities();
    setOpps(stored);
  };

  useEffect(() => {
    refreshOpportunities();
  }, []);

  const handleSyncWeb = async () => {
    setSyncing(true);
    try {
      await syncLiveWebOpportunities();
      refreshOpportunities();
      setSyncSuccess(true);
    } catch (err) {
      console.error('Web sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSave = (id: string) => {
    const updated = opps.map(o => {
      if (o.id === id) {
        return { ...o, status: o.status === 'Saved' ? 'To Apply' : 'Saved' };
      }
      return o;
    });
    setOpps(updated);
    saveOpportunities(updated);
  };

  const filteredOpps = (opps || [])
    .filter(o => {
      if (!o) return false;
      if (savedOnly && o.status !== 'Saved') return false;

      // Robust type matching (handles both Conference & Research, internships, hackathons, and networking events)
      if (typeFilter !== 'All' && !matchesTypeFilter(o.type, typeFilter)) {
        return false;
      }

      if (eligibilityFilter !== 'All' && o.eligibility !== eligibilityFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (o.title || '').toLowerCase().includes(q);
        const matchOrg = (o.organization || '').toLowerCase().includes(q);
        const skillsList = Array.isArray(o.skillsRequired) ? o.skillsRequired : [];
        const matchSkills = skillsList.some(s => typeof s === 'string' && s.toLowerCase().includes(q));
        if (!matchTitle && !matchOrg && !matchSkills) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        const dA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        const safeA = isNaN(dA) ? Infinity : dA;
        const safeB = isNaN(dB) ? Infinity : dB;
        return safeA - safeB;
      }
      if (sortBy === 'match') {
        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      }
      return 0;
    });

  const getPageTitle = () => {
    if (savedOnly) return 'Saved Opportunities';
    const norm = (typeFilter || '').toLowerCase();
    if (norm === 'conference' || norm === 'research') return 'Conferences & Research';
    if (norm === 'networking') return 'Networking Events';
    if (norm === 'all') return 'All Opportunities';
    return `${typeFilter} Opportunities`;
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {getPageTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOpps.length} verified opportunities matched to your student profile
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            onClick={handleSyncWeb}
            disabled={syncing}
            startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            {syncing ? 'Scraping Web Feeds...' : 'Sync Live Opportunities'}
          </Button>

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
              boxShadow: '0 4px 14px rgba(106, 27, 154, 0.35)',
            }}
          >
            Capture Announcement
          </Button>
        </Stack>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by title, company, or skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {!savedOnly && (
              <Grid item xs={6} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)}>
                    <MenuItem value="All">All Types</MenuItem>
                    <MenuItem value="Internship">Internships</MenuItem>
                    <MenuItem value="Hackathon">Hackathons</MenuItem>
                    <MenuItem value="Conference">Conferences & Research</MenuItem>
                    <MenuItem value="Networking">Networking Events</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={6} sm={4} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Eligibility</InputLabel>
                <Select value={eligibilityFilter} label="Eligibility" onChange={e => setEligibilityFilter(e.target.value)}>
                  <MenuItem value="All">All Eligibility</MenuItem>
                  <MenuItem value="Eligible">Eligible</MenuItem>
                  <MenuItem value="Potentially Eligible">Potentially Eligible</MenuItem>
                  <MenuItem value="Ineligible">Ineligible</MenuItem>
                  <MenuItem value="Unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
                  <MenuItem value="deadline">Soonest Deadline</MenuItem>
                  <MenuItem value="match">Highest Match Score</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      <Grid container spacing={2.5}>
        {filteredOpps.map(o => {
          const skillsList = Array.isArray(o.skillsRequired) ? o.skillsRequired : [];

          return (
            <Grid item xs={12} md={6} lg={4} key={o.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(76, 78, 100, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Stack direction="row" spacing={0.8}>
                      <Chip label={o.type} size="small" color="primary" sx={{ fontWeight: 600, height: 22 }} />
                      <Chip
                        label={o.eligibility || 'Eligible'}
                        size="small"
                        color={getEligibilityColor(o.eligibility)}
                        sx={{ fontWeight: 600, height: 22 }}
                      />
                    </Stack>
                    <Tooltip title={o.status === 'Saved' ? 'Remove from saved' : 'Save opportunity'}>
                      <IconButton
                        size="small"
                        aria-label={o.status === 'Saved' ? `Remove ${o.title} from saved` : `Save ${o.title}`}
                        onClick={() => handleToggleSave(o.id)}
                        color={o.status === 'Saved' ? 'primary' : 'default'}
                      >
                        {o.status === 'Saved' ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
                    {o.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {o.organization} • {o.source || 'Google Search'}
                  </Typography>

                  {/* Location & Compensation badges */}
                  <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                    {o.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'text.secondary', fontSize: '0.78rem' }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {o.location}
                        </Typography>
                      </Box>
                    )}
                    {o.compensationOrFees && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'success.main', fontSize: '0.78rem' }}>
                        <MonetizationOnOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {o.compensationOrFees}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {o.description}
                  </Typography>

                  {/* Skills tags */}
                  <Box sx={{ mb: 2, flexGrow: 1 }}>
                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                      {skillsList.slice(0, 4).map((skill, i) => (
                        <Chip key={i} label={skill} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Bottom Card Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonthIcon fontSize="inherit" />
                        {formatDeadline(o.deadline)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {o.matchScore ?? 75}% match
                      </Typography>
                      {o.applicationUrl && (
                        <IconButton
                          size="small"
                          href={o.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open application link for ${o.title}`}
                          title="Open official link"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {filteredOpps.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <LanguageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No opportunities currently listed in this category
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                Click below to scrape and sync the latest verified opportunities from Unstop, Devpost, LinkedIn, and conference portals.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={handleSyncWeb}
                  disabled={syncing}
                  startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {syncing ? 'Scraping Web...' : 'Sync Live Opportunities Now'}
                </Button>
                <Button variant="outlined" component={Link} to="/capture" sx={{ borderRadius: 2 }}>
                  Capture Announcement
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={syncSuccess}
        autoHideDuration={4000}
        onClose={() => setSyncSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setSyncSuccess(false)}>
          Live opportunities scraped & synced successfully from web sources!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpportunitiesList;
