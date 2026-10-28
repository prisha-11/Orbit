import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { saveOpportunities, saveProfile } from '../utils/localStorage';
import sampleOpportunities from '../data/sampleOpportunities';
import sampleProfile from '../data/sampleProfile';

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    saveOpportunities(sampleOpportunities);
    saveProfile(sampleProfile);
  });

  it('renders overview stats cards', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Opportunity Intelligence Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Eligible Internships/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Hackathons/i)).toBeInTheDocument();
    expect(screen.getByText(/Upcoming Deadlines/i)).toBeInTheDocument();
  });

  it('renders recent opportunity announcements', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Priority Opportunities/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Amazon|Google|Microsoft|Devpost/i).length).toBeGreaterThan(0);
  });
});
