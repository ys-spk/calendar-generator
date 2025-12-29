import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('主要UIが表示される', () => {
    render(<App />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('annual-calendar-card')).toBeInTheDocument();
    expect(screen.getAllByTestId('monthly-calendar-card')).toHaveLength(12);
  });

  it('翌年/前年ボタンで年が更新される', async () => {
    const user = userEvent.setup();
    const baseYear = new Date().getFullYear() + 1;

    render(<App />);
    expect(screen.getByText(`${baseYear} CALENDAR`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '翌年' }));
    expect(screen.getByText(`${baseYear + 1} CALENDAR`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '前年' }));
    expect(screen.getByText(`${baseYear} CALENDAR`)).toBeInTheDocument();
  });
});
