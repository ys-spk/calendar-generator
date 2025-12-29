import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('主要UIが表示される', () => {
    render(<App />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('annual-calendar-card')).toBeInTheDocument();
    expect(screen.getAllByTestId('monthly-calendar-card')).toHaveLength(12);
  });

  it('印刷ボタンで window.print が呼ばれる', async () => {
    const printMock = vi.fn();
    vi.stubGlobal('print', printMock);
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: '印刷' }));

    expect(printMock).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('年入力欄をblurするとcommitYearが呼ばれる', async () => {
    const user = userEvent.setup();

    render(<App />);
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.tab();

    // blur後もUIが壊れていないことを確認
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });

  it('年入力欄でEnterキーを押すとhandleYearKeyDownが呼ばれる', async () => {
    const user = userEvent.setup();

    render(<App />);
    const input = screen.getByRole('spinbutton');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
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
