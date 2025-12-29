import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  const defaultProps = {
    yearInput: '2025',
    onYearInputChange: vi.fn(),
    onYearInputBlur: vi.fn(),
    onYearInputKeyDown: vi.fn(),
    onAdjustYear: vi.fn(),
    onPrint: vi.fn(),
  };

  it('印刷ボタン', async () => {
    const onPrint = vi.fn();
    render(<AppHeader {...defaultProps} onPrint={onPrint} />);

    await userEvent.click(screen.getByRole('button', { name: '印刷' }));

    expect(onPrint).toHaveBeenCalledOnce();
  });

  it('年の変更', async () => {
    const onYearInputChange = vi.fn();
    render(<AppHeader {...defaultProps} onYearInputChange={onYearInputChange} />);

    await userEvent.type(screen.getByRole('spinbutton'), '6');

    expect(onYearInputChange).toHaveBeenCalled();
  });

  it('年の入力欄からフォーカスを外す', async () => {
    const onYearInputBlur = vi.fn();
    render(<AppHeader {...defaultProps} onYearInputBlur={onYearInputBlur} />);

    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.tab();

    expect(onYearInputBlur).toHaveBeenCalled();
  });

  it('年の入力欄でEnterキー押下', async () => {
    const onYearInputKeyDown = vi.fn();
    render(<AppHeader {...defaultProps} onYearInputKeyDown={onYearInputKeyDown} />);

    const input = screen.getByRole('spinbutton');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');

    expect(onYearInputKeyDown).toHaveBeenCalled();
  });

  it('前年ボタン', async () => {
    const onAdjustYear = vi.fn();
    render(<AppHeader {...defaultProps} onAdjustYear={onAdjustYear} />);

    await userEvent.click(screen.getByRole('button', { name: '前年' }));

    expect(onAdjustYear).toHaveBeenCalledWith(-1);
  });

  it('翌年ボタン', async () => {
    const onAdjustYear = vi.fn();
    render(<AppHeader {...defaultProps} onAdjustYear={onAdjustYear} />);

    await userEvent.click(screen.getByRole('button', { name: '翌年' }));

    expect(onAdjustYear).toHaveBeenCalledWith(1);
  });
});
