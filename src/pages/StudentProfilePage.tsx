import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { StudentProfile } from '../types';
import { loadProfile, saveProfile } from '../utils/localStorage';
import sampleProfile from '../data/sampleProfile';

const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile>(sampleProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // String representations for list inputs
  const [skillsStr, setSkillsStr] = useState('');
  const [interestsStr, setInterestsStr] = useState('');
  const [companiesStr, setCompaniesStr] = useState('');
  const [rolesStr, setRolesStr] = useState('');
  const [locationsStr, setLocationsStr] = useState('');
  const [researchStr, setResearchStr] = useState('');

  useEffect(() => {
    const p = loadProfile() || sampleProfile;
    setProfile(p);
    setSkillsStr((p.skills || []).join(', '));
    setInterestsStr((p.interests || []).join(', '));
    setCompaniesStr((p.targetCompanies || []).join(', '));
    setRolesStr((p.desiredRoles || []).join(', '));
    setLocationsStr((p.preferredLocations || []).join(', '));
    setResearchStr((p.researchInterests || []).join(', '));
  }, []);

  const handleSave = () => {
    const updated: StudentProfile = {
      ...profile,
      skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
      interests: interestsStr.split(',').map(s => s.trim()).filter(Boolean),
      targetCompanies: companiesStr.split(',').map(s => s.trim()).filter(Boolean),
      desiredRoles: rolesStr.split(',').map(s => s.trim()).filter(Boolean),
      preferredLocations: locationsStr.split(',').map(s => s.trim()).filter(Boolean),
      researchInterests: researchStr.split(',').map(s => s.trim()).filter(Boolean),
    };
    saveProfile(updated);
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Student Eligibility Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your academic details, skills, and target companies used by GPT-4o to calculate eligibility and match scores
        </Typography>
      </Box>

      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Profile updated successfully! New match scores will automatically calibrate.
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonOutlineIcon color="primary" /> Academic Information
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Degree"
                value={profile.degree}
                onChange={e => setProfile({ ...profile, degree: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Branch / Major"
                value={profile.branch}
                onChange={e => setProfile({ ...profile, branch: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Current Year of Study"
                value={profile.year}
                onChange={e => setProfile({ ...profile, year: parseInt(e.target.value) || 1 })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Skills & Career Interests
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technical Skills (comma-separated)"
                helperText="E.g., Python, React, Node.js, Docker, Machine Learning, SQL"
                value={skillsStr}
                onChange={e => setSkillsStr(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Companies (comma-separated)"
                helperText="E.g., Google, Microsoft, Amazon, Stripe, Anthropic"
                value={companiesStr}
                onChange={e => setCompaniesStr(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Desired Roles (comma-separated)"
                helperText="E.g., Software Engineer, Data Scientist, ML Engineer"
                value={rolesStr}
                onChange={e => setRolesStr(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="General Interests (comma-separated)"
                helperText="E.g., AI, Web Development, Cloud Computing"
                value={interestsStr}
                onChange={e => setInterestsStr(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Locations (comma-separated)"
                helperText="E.g., Bangalore, Remote, Hyderabad, San Francisco"
                value={locationsStr}
                onChange={e => setLocationsStr(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Interests (comma-separated)"
                helperText="E.g., Large Language Models, Quantum Computing, Distributed Systems"
                value={researchStr}
                onChange={e => setResearchStr(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
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
              Save Profile Changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentProfilePage;
