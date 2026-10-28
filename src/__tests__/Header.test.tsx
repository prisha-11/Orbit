import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header';

describe('Header Component', () => {
  it('renders branding and user profile avatar', () => {
    const handleToggle = vi.fn();
    render(
      <MemoryRouter>
        <Header darkMode={false} onToggleDarkMode={handleToggle} />
      </MemoryRouter>
    );

    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText(/B.Tech CS • 3rd Year/i)).toBeInTheDocument();
  });

  it('triggers dark mode toggle callback when theme button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <MemoryRouter>
        <Header darkMode={false} onToggleDarkMode={handleToggle} />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('opens profile dropdown menu upon clicking the profile button', () => {
    const handleToggle = vi.fn();
    render(
      <MemoryRouter>
        <Header darkMode={false} onToggleDarkMode={handleToggle} />
      </MemoryRouter>
    );

    const profileButton = screen.getByRole('button', { name: /user profile and account menu/i });
    fireEvent.click(profileButton);

    expect(screen.getByText(/alex.morgan@university.edu/i)).toBeInTheDocument();
    expect(screen.getByText(/Eligibility Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved Opportunities/i)).toBeInTheDocument();
  });
});
