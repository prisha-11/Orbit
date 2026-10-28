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
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';

import { Opportunity } from '../types';
import { loadOpportunities, saveOpportunities } from '../utils/localStorage';
import sampleOpps from '../data/sampleOpportunities';

interface OpportunitiesListProps {
  initialType?: string;
  savedOnly?: boolean;
}

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ initialType = 'All', savedOnly = false }) => {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('deadline');

  useEffect(() => {
    let stored = loadOpportunities();
    if (stored.length === 0) {
      saveOpportunities(sampleOpps);
      stored = sampleOpps;
    }
    setOpps(stored);
  }, []);

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

  const filteredOpps = opps.filter(o => {
    if (savedOnly && o.status !== 'Saved') return false;
    if (typeFilter !== 'All' && o.type !== typeFilter) return false;
    if (eligibilityFilter !== 'All' && o.eligibility !== eligibilityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = o.title.toLowerCase().includes(q);
      const matchOrg = o.organization.toLowerCase().includes(q);
      const matchSkills = (o.skillsRequired || []).some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchOrg && !matchSkills) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'deadline') {
      const dA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dA - dB;
    }
    if (sortBy === 'match') {
      return (b.matchScore ?? 0) - (a.matchScore ?? 0);
    }
    return 0;
  });

  const getEligibilityColor = (elig?: string) => {
    switch (elig) {
      case 'Eligible': return 'success';
      case 'Potentially Eligible': return 'warning';
      case 'Ineligible': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {savedOnly ? 'Saved Opportunities' : `${typeFilter === 'All' ? 'All' : typeFilter} Opportunities`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOpps.length} opportunities matched to your profile
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
          Capture New Announcement
        </Button>
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
                    <MenuItem value="Internship">Internship</MenuItem>
                    <MenuItem value="Hackathon">Hackathon</MenuItem>
                    <MenuItem value="Conference">Conference</MenuItem>
                    <MenuItem value="Research">Research</MenuItem>
                    <MenuItem value="Networking">Networking</MenuItem>
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
        {filteredOpps.map(o => (
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
                      label={o.eligibility}
                      size="small"
                      color={getEligibilityColor(o.eligibility) as any}
                      sx={{ fontWeight: 600, height: 22 }}
                    />
                  </Stack>
                  <Tooltip title={o.status === 'Saved' ? 'Saved' : 'Save opportunity'}>
                    <IconButton size="small" onClick={() => handleToggleSave(o.id)} color={o.status === 'Saved' ? 'primary' : 'default'}>
                      {o.status === 'Saved' ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
                  {o.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {o.organization} • {o.source}
                </Typography>

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
                    {(o.skillsRequired || []).slice(0, 4).map((skill, i) => (
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
                      {o.deadline ? new Date(o.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No deadline'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {o.matchScore ?? 75}% match
                    </Typography>
                    {o.applicationUrl && (
                      <IconButton size="small" href={o.applicationUrl} target="_blank" rel="noreferrer">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredOpps.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No opportunities match your filter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search criteria or capture new announcements using GPT-4o.
              </Typography>
              <Button variant="contained" component={Link} to="/capture" sx={{ borderRadius: 2 }}>
                Capture Announcement
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OpportunitiesList;
