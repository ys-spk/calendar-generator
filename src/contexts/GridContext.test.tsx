import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GridProvider, useGrid } from './GridContext';

function GridConsumer() {
  const { yearGrid, holidays } = useGrid();
  return (
    <>
      <div data-testid="grid-year">{yearGrid.year}</div>
      <div data-testid="holiday-count">{Object.keys(holidays).length}</div>
    </>
  );
}

describe('GridContext', () => {
  it('GridProviderの外でuseGridを使うとエラーになる', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<GridConsumer />)).toThrow('useGrid must be used within a GridProvider');
    spy.mockRestore();
  });

  it('GridProviderがgridデータを供給する', () => {
    render(
      <GridProvider year={2024}>
        <GridConsumer />
      </GridProvider>
    );

    expect(screen.getByTestId('grid-year')).toHaveTextContent('2024');
    expect(Number(screen.getByTestId('holiday-count').textContent)).toBeGreaterThan(0);
  });
});
