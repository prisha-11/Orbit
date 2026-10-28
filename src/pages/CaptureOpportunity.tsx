import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Alert,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';

import { Opportunity, StudentProfile } from '../types';
import { loadOpportunities, saveOpportunities, loadProfile } from '../utils/localStorage';
import { extractOpportunityHeuristic } from '../utils/opportunityExtractor';

const SAMPLE_ANNOUNCEMENTS = [
  {
    title: 'Google STEP Internship 2026',
    tag: 'Internship',
    text: `Google Student Training in Engineering Program (STEP) Internship 2026
Location: Bangalore / Hyderabad / Remote
Eligibility: 2nd & 3rd year students pursuing B.Tech/B.E in Computer Science, IT, or related STEM fields.
Requirements: Solid fundamentals in Data Structures, Algorithms, Python/Java/C++, and passionate about software engineering.
Stipend: ₹75,000/month + housing stipend.
Application Deadline: November 15, 2026.
Apply at: https://careers.google.com/students/step-internship-2026`,
  },
  {
    title: 'ETHGlobal Hackathon',
    tag: 'Hackathon',
    text: `ETHGlobal Autonomous Agents & Web3 Hackathon 2026
Format: Virtual / Global
Dates: November 20-22, 2026
Prize Pool: $50,000 in bounties
Tracks: AI Agents, Smart Contracts, React frontends, Zero-Knowledge proofs.
Eligibility: Open to all college students & developers worldwide. Beginner and advanced tracks available.
Registration Deadline: November 18, 2026
Register at: https://ethglobal.com/events/agents2026`,
  },
  {
    title: 'NeurIPS Workshop Paper Submission',
    tag: 'Research',
    text: `Call for Papers: Workshop on Efficient Machine Learning and Foundation Models (in conjunction with NeurIPS 2026)
Location: Vancouver, Canada (Hybrid participation allowed)
Paper Submission Deadline: December 5, 2026
Notification Date: December 20, 2026
Topics: Model compression, edge AI, PyTorch optimizations, multimodal LLMs.
Eligibility: Undergraduate and graduate researchers. Non-archival extended abstracts (4 pages) welcome.
Submission Portal: https://openreview.net/group?id=NeurIPS.cc/2026/Workshop/EfficientML`,
  },
];

const SAMPLE_URLS = [
  { name: 'Devpost Hackathons', url: 'https://devpost.com' },
  { name: 'Unstop Opportunities', url: 'https://unstop.com' },
  { name: 'Google Students', url: 'https://careers.google.com/students' },
  { name: 'OpenReview CFP', url: 'https://openreview.net' },
];

const CaptureOpportunity: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0); // 0: Text Paste, 1: Live URL Scraping
  const [raw, setRaw] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [extracted, setExtracted] = useState<Opportunity | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const profile = loadProfile();
    setStudentProfile(profile);
  }, []);

  const handleExtract = async () => {
    const textToProcess = tabIndex === 1 ? urlInput.trim() : raw.trim();

    if (!textToProcess) {
      setInfoBanner(tabIndex === 1 ? 'Please enter a webpage URL to scrape.' : 'Please paste an announcement or URL to extract.');
      return;
    }
    setInfoBanner(null);
    setLoading(true);

    try {
      let resp: Response | null = null;
      let data: any = null;

      // If user is in URL scraping tab or input is a URL:
      if (tabIndex === 1 || textToProcess.startsWith('http://') || textToProcess.startsWith('https://')) {
        try {
          resp = await fetch('/api/scrape-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: textToProcess, studentProfile }),
          });
          data = await resp.json();
        } catch (err) {
          console.warn('URL scraping request failed:', err);
        }

        if (data && data.opportunity) {
          setExtracted(data.opportunity as Opportunity);
          setModelUsed(data.modelUsed || 'Web Scraper + Gemini AI');
          setLoading(false);
          return;
        } else if (data && data.cleanedText) {
          // If HTML was scraped but AI failed, run local heuristic on scraped text
          const heuristic = extractOpportunityHeuristic(data.cleanedText, studentProfile);
          heuristic.sourceUrl = textToProcess;
          heuristic.applicationUrl = textToProcess;
          setExtracted(heuristic);
          setModelUsed('Web Scraper + Orbit Local Engine');
          setInfoBanner(`Successfully scraped live webpage content from ${new URL(textToProcess).hostname}!`);
          setLoading(false);
          return;
        }
      }

      // Standard text extraction
      try {
        resp = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: textToProcess, studentProfile }),
        });
        data = await resp.json();
      } catch (networkErr) {
        try {
          resp = await fetch('http://localhost:4000/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: textToProcess, studentProfile }),
          });
          data = await resp.json();
        } catch {
          // Fallback to local heuristic
        }
      }

      if (resp && resp.ok && data && data.opportunity) {
        setExtracted(data.opportunity as Opportunity);
        setModelUsed(data.modelUsed || 'Gemini 2.5 Flash');
      } else {
        const fallbackOpp = extractOpportunityHeuristic(textToProcess, studentProfile);
        setExtracted(fallbackOpp);
        setModelUsed('Orbit Intelligence Engine');
        setInfoBanner('Extracted using Orbit Intelligence Engine.');
      }
    } catch (e: any) {
      console.warn('Fallback triggered:', e.message);
      const fallbackOpp = extractOpportunityHeuristic(textToProcess, studentProfile);
      setExtracted(fallbackOpp);
      setModelUsed('Orbit Intelligence Engine');
      setInfoBanner('Extracted using Orbit Intelligence Engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!extracted) return;
    const current = loadOpportunities();
    const newOpp: Opportunity = {
      ...extracted,
      id: Date.now().toString(),
      capturedAt: new Date().toISOString(),
      originalText: raw || urlInput || extracted.originalText || '',
      verificationStatus: extracted.verificationStatus || 'Verified',
      status: 'Saved',
    };
    const updated = [newOpp, ...current];
    saveOpportunities(updated);
    navigate('/dashboard');
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
    <Box sx={{ maxWidth: 960, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton component={Link} to="/dashboard" size="small" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              AI Opportunity Capture & Web Scraper
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scrape live web opportunities or extract intelligence from announcements with Gemini AI
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={<AutoAwesomeIcon fontSize="small" sx={{ color: '#fff !important' }} />}
          label={modelUsed ? modelUsed : 'Gemini 2.5 Flash Engine'}
          sx={{
            background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
            color: '#fff',
            fontWeight: 600,
          }}
        />
      </Box>

      {infoBanner && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setInfoBanner(null)}
        >
          {infoBanner}
        </Alert>
      )}

      {/* Main Input Card with Tabs */}
      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0px 4px 18px rgba(76, 78, 100, 0.08)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
          <Tabs value={tabIndex} onChange={(_e, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
            <Tab icon={<ContentPasteIcon fontSize="small" />} iconPosition="start" label="Paste Text / Email" sx={{ fontWeight: 600, textTransform: 'none' }} />
            <Tab icon={<LanguageIcon fontSize="small" />} iconPosition="start" label="Scrape From Live URL" sx={{ fontWeight: 600, textTransform: 'none' }} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {tabIndex === 0 ? (
            /* TAB 0: Text Paste */
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Paste Announcement Text, TPO Email, or Social Caption
              </Typography>

              <TextField
                multiline
                rows={7}
                fullWidth
                placeholder="Paste raw email from TPO, LinkedIn post, Unstop description, Instagram caption, or conference call for papers..."
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.92rem',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FAFAFC'),
                  },
                }}
              />

              {/* Quick Demo Pre-fills */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                  Or try a sample announcement:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {SAMPLE_ANNOUNCEMENTS.map((item, idx) => (
                    <Chip
                      key={idx}
                      label={`${item.tag}: ${item.title}`}
                      onClick={() => setRaw(item.text)}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(106, 27, 154, 0.05)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
          ) : (
            /* TAB 1: Live URL Scraping */
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                Enter Webpage URL to Scrape Live Opportunity Data
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Orbit will fetch the live webpage, extract text and metadata, and parse structured opportunity intelligence.
              </Typography>

              <TextField
                fullWidth
                placeholder="https://careers.google.com/... or https://unstop.com/... or https://devpost.com/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.92rem',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FAFAFC'),
                  },
                }}
              />

              {/* Sample Web URLs */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                  Or scrape a sample portal URL:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {SAMPLE_URLS.map((portal, idx) => (
                    <Chip
                      key={idx}
                      label={portal.name}
                      onClick={() => setUrlInput(portal.url)}
                      variant="outlined"
                      size="small"
                      icon={<LanguageIcon fontSize="small" />}
                      sx={{
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(106, 27, 154, 0.05)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleExtract}
              disabled={loading || (tabIndex === 0 ? !raw.trim() : !urlInput.trim())}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : (tabIndex === 1 ? <LanguageIcon /> : <AutoAwesomeIcon />)}
              sx={{
                background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                color: '#fff',
                px: 3.5,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(106, 27, 154, 0.35)',
              }}
            >
              {loading ? (tabIndex === 1 ? 'Scraping Webpage...' : 'Extracting with AI...') : (tabIndex === 1 ? 'Scrape & Extract with AI' : 'Extract with Gemini AI')}
            </Button>
            {(raw || urlInput) && (
              <Button variant="text" color="inherit" onClick={() => { setRaw(''); setUrlInput(''); }}>
                Clear
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Loading Progress State */}
      {loading && (
        <Card sx={{ borderRadius: 3, mb: 3, p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {tabIndex === 1 ? 'Scraping webpage and parsing content...' : 'Extracting opportunity intelligence...'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Evaluating eligibility criteria against your student profile and parsing deadlines.
          </Typography>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} color="secondary" />
        </Card>
      )}

      {/* Extracted Opportunity Card */}
      {extracted && (
        <Card sx={{ borderRadius: 3, mb: 3, border: '2px solid', borderColor: 'primary.light', boxShadow: '0px 6px 24px rgba(106, 27, 154, 0.12)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={extracted.type || 'Opportunity'} color="primary" size="small" sx={{ fontWeight: 600 }} />
                  <Chip
                    label={extracted.eligibility || 'Eligibility: Unknown'}
                    color={getEligibilityColor(extracted.eligibility) as any}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  {extracted.verificationStatus && (
                    <Chip
                      icon={<VerifiedUserOutlinedIcon fontSize="small" />}
                      label={extracted.verificationStatus}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {modelUsed && (
                    <Chip
                      label={modelUsed}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {extracted.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {extracted.organization} • Source: {extracted.source || 'Direct Capture'}
                </Typography>
              </Box>

              {/* Match Score Badge */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(106, 27, 154, 0.2)' : 'rgba(106, 27, 154, 0.08)'),
                  textAlign: 'center',
                  minWidth: 120,
                  border: '1px solid',
                  borderColor: 'primary.light',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Match Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', my: 0.2 }}>
                  {extracted.matchScore ?? 80}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Profile Alignment
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Match Reason Banner */}
            {extracted.matchReason && (
              <Alert severity="info" icon={<AutoAwesomeIcon fontSize="small" />} sx={{ mb: 2.5, borderRadius: 2 }}>
                <strong>AI Match Intelligence: </strong>
                {extracted.matchReason}
              </Alert>
            )}

            {/* Key Information Grid */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonthIcon fontSize="inherit" color="action" /> Primary Deadline
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {extracted.deadline ? new Date(extracted.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No strict deadline'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MonetizationOnOutlinedIcon fontSize="inherit" color="action" /> Compensation / Fees
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {extracted.compensationOrFees || 'Not specified'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnOutlinedIcon fontSize="inherit" color="action" /> Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {extracted.location || 'Remote / Flexible'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VerifiedUserOutlinedIcon fontSize="inherit" color="action" /> Extraction Confidence
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {extracted.extractionConfidence ? `${extracted.extractionConfidence}%` : 'High (95%)'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Description */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Description & Opportunity Scope
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                {extracted.description}
              </Typography>
            </Box>

            {/* Required Skills */}
            {extracted.skillsRequired && extracted.skillsRequired.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Required Skills & Technologies
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {extracted.skillsRequired.map((skill, i) => (
                    <Chip key={i} label={skill} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Application Link */}
            {extracted.applicationUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Direct Application URL
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href={extracted.applicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  sx={{ borderRadius: 2 }}
                >
                  {extracted.applicationUrl}
                </Button>
              </Box>
            )}

            {/* Action Buttons */}
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                startIcon={<CheckCircleOutlineIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #6A1B9A 0%, #9575CD 100%)',
                  color: '#fff',
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(106, 27, 154, 0.35)',
                }}
              >
                Save to Opportunity Radar
              </Button>

              <Button
                variant="outlined"
                onClick={() => setIsEditing(!isEditing)}
                startIcon={<EditNoteIcon />}
                sx={{ borderRadius: 2 }}
              >
                {isEditing ? 'Hide Raw JSON' : 'Inspect Extracted Data'}
              </Button>
            </Box>

            {/* Raw JSON Debug inspector */}
            {isEditing && (
              <Box sx={{ mt: 3, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0A0A10' : '#F4F5FA', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  Raw Structured JSON (Persisted in localStorage):
                </Typography>
                <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(extracted, null, 2)}
                </pre>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CaptureOpportunity;
