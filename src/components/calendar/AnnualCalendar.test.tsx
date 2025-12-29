import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GridProvider } from '../../contexts/GridContext';
import { AnnualCalendar } from './AnnualCalendar';

describe('AnnualCalendar', () => {
  it('年次カレンダーを12か月分表示する', () => {
    render(
      <GridProvider year={2024}>
        <AnnualCalendar />
      </GridProvider>
    );

    expect(screen.getByTestId('annual-calendar-card')).toBeInTheDocument();
    expect(screen.getByText('2024 CALENDAR')).toBeInTheDocument();
    expect(screen.getAllByTestId(/annual-month-/)).toHaveLength(12);
  });
});
