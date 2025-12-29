import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GridProvider } from '../../contexts/GridContext';
import { MonthlyCalendarList } from './MonthlyCalendarList';

describe('MonthlyCalendarList', () => {
  it('月次カレンダーを12か月分表示する', () => {
    render(
      <GridProvider year={2024}>
        <MonthlyCalendarList />
      </GridProvider>
    );

    expect(screen.getAllByTestId('monthly-calendar-card')).toHaveLength(12);
    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('December 2024')).toBeInTheDocument();
  });
});
