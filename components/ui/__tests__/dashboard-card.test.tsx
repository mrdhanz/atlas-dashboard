import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardCard } from '../dashboard-card';
import { FolderKanban } from 'lucide-react';

describe('DashboardCard', () => {
  it('renders the correct title, value, and description', () => {
    render(
      <DashboardCard
        title="Test Projects"
        icon={FolderKanban}
        value="42"
        description="A test description"
      />
    );

    expect(screen.getByText('Test Projects')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
  });
});