import { describe, expect, it } from 'vitest';
import { buildCalendarYearGrid, buildTypstSource, loadMergedHolidays } from './document';

describe('typstDocument', () => {
  it('buildCalendarYearGrid は年を正規化しつつ 12 ヶ月分のグリッドを返す', () => {
    const yearGrid = buildCalendarYearGrid(12000);

    expect(yearGrid.year).toBe(9999);
    expect(yearGrid.monthGrids).toHaveLength(12);
  });

  it('loadMergedHolidays は前後年を含む祝日を解決する', () => {
    const holidays = loadMergedHolidays(2026);

    expect(holidays['2025-1-1']).toBe('元日');
    expect(holidays['2027-1-11']).toBe('成人の日');
  });

  it('buildTypstSource は年間ページと月間4ページを含む 5 ページ構成を生成する', () => {
    const source = buildTypstSource(buildCalendarYearGrid(2026));

    expect(source).toContain(
      '#set text(font: ("Mplus 2", "M PLUS 2", "Noto Serif CJK SC"), lang: "ja")'
    );
    expect(source).toContain('2026 CALENDAR');
    expect(source).toContain('January 2026');
    expect(source.match(/#pagebreak\(\)/g)).toHaveLength(3);
    expect(source.match(/#set page\(paper: "a4", margin: 15mm, fill: white\)/g)).toHaveLength(5);
  });
});
