import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OpportunitiesList from '../pages/OpportunitiesList';
import { saveOpportunities } from '../utils/localStorage';
import sampleOpportunities from '../data/sampleOpportunities';

describe('OpportunitiesList Component', () => {
  beforeEach(() => {
    localStorage.clear();
    saveOpportunities(sampleOpportunities);
  });

  it('renders opportunity cards with titles and organizations', () => {
    render(
      <MemoryRouter>
        <OpportunitiesList initialType="All" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /All Opportunities/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by title, company, or skills/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Amazon|Google|Microsoft|Devpost/i).length).toBeGreaterThan(0);
  });

  it('filters specifically by Internship type', () => {
    render(
      <MemoryRouter>
        <OpportunitiesList initialType="Internship" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Internship Opportunities/i })).toBeInTheDocument();
    expect(screen.getByText(/Amazon Software Development Engineer/i)).toBeInTheDocument();
  });

  it('filters specifically by Hackathon type', () => {
    render(
      <MemoryRouter>
        <OpportunitiesList initialType="Hackathon" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Hackathon Opportunities/i })).toBeInTheDocument();
    expect(screen.getByText(/Devpost Global Agentic AI Hackathon/i)).toBeInTheDocument();
  });

  it('filters specifically by Conference type', () => {
    render(
      <MemoryRouter>
        <OpportunitiesList initialType="Conference" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Conferences & Research/i })).toBeInTheDocument();
    expect(screen.getByText(/NeurIPS 2026/i)).toBeInTheDocument();
  });

  it('filters specifically by Networking type', () => {
    render(
      <MemoryRouter>
        <OpportunitiesList initialType="Networking" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Networking Events/i })).toBeInTheDocument();
    expect(screen.getByText(/Google Developer Groups \(GDG\) DevFest 2026/i)).toBeInTheDocument();
  });

  it('filters search results dynamically when query is entered', () => {
    render(
      <MemoryRouter>
        <OpportunitiesList initialType="All" />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search by title, company, or skills/i);
    fireEvent.change(searchInput, { target: { value: 'Jane Street' } });

    expect(screen.getByText(/Jane Street Quantitative SWE Summer Intern/i)).toBeInTheDocument();
  });
});
