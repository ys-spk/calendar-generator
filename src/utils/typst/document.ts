import { buildYearGrid, getCellColorType, type CalendarCell, type YearGrid } from '../calendar';
import { loadHolidays } from '../holidays';
import { clampYear } from '../yearValidation';
import { typstLayout } from './layout';

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const TYPST_COLOR = {
  holiday: 'c-h',
  saturday: 'c-s',
  weekday: 'c-w',
  'out-of-month': 'c-o',
} as const satisfies Record<ReturnType<typeof getCellColorType>, string>;

const TYPOGRAPHY_PREAMBLE = `#set text(font: "M PLUS 2", lang: "ja")
#let c-h = rgb("#ef4444")
#let c-s = rgb("#1d4ed8")
#let c-w = rgb("#000000")
#let c-o = rgb("#d4d4d4")
#let c-g = rgb("#d4d4d4")`;
const PAGE_SETUP = `paper: "a4", margin: ${typstLayout.pageMargin}, fill: white`;

function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function escUnbreakable(value: string): string {
  return Array.from(value)
    .map((char) => esc(char))
    .join('\u2060');
}

function buildAnnualMonth(month: number, dayCells: CalendarCell[]): string {
  const { annual, zeroSpacing } = typstLayout;

  const weekdayHeaders = WEEKDAY_JA.map((label, index) => {
    const color = index === 0 ? 'c-h' : index === 6 ? 'c-s' : 'c-w';
    return `grid.cell(
      stroke: (bottom: ${annual.weekdayStrokeWidth} + c-g),
      inset: ${annual.cellInset}
    )[
      #align(center + horizon)[
        #text(fill: ${color}, size: ${annual.weekdayFontSize}, weight: 700)[${label}]
      ]
    ]`;
  }).join(', ');

  const paddedCells: (CalendarCell | null)[] = [...dayCells];
  while (paddedCells.length < annual.dateRows * 7) paddedCells.push(null);

  const dateCells = paddedCells
    .map((cell) => {
      if (!cell?.inMonth) return '[]';
      const color = TYPST_COLOR[getCellColorType(cell)];
      return `[#pad(top: ${annual.dateTopPadding})[#align(center)[#text(fill: ${color}, size: ${annual.dateFontSize}, weight: 700)[${cell.date.getDate()}]]]]`;
    })
    .join(', ');

  const rowsSpec = `(${annual.monthLabelHeight}, ${annual.weekdayHeight}, ${Array(annual.dateRows)
    .fill(annual.dateRowHeight)
    .join(', ')})`;

  return `[#block(width: 100%, height: ${annual.monthHeight}, spacing: ${zeroSpacing})[
    #grid(
      columns: (1fr,) * 7,
      rows: ${rowsSpec},
      gutter: ${annual.gridGutter},
      grid.cell(colspan: 7, inset: ${annual.cellInset}, align: left + bottom)[
        #move(dy: ${annual.monthLabelOffsetY})[#pad(left: ${annual.monthLabelPaddingLeft})[#text(size: ${annual.monthLabelFontSize}, weight: 800)[${month}]]]
      ],
      ${weekdayHeaders},
      ${dateCells}
    )
  ]]`;
}

function buildAnnualPage(year: number, monthGrids: YearGrid['monthGrids']): string {
  const { annual, zeroSpacing } = typstLayout;
  const annualMonths = monthGrids.map(({ month, dayCells }) => buildAnnualMonth(month, dayCells));

  const rows = [];
  for (let index = 0; index < 12; index += 3) {
    rows.push(
      `${annualMonths[index]}, [], ${annualMonths[index + 1]}, [], ${annualMonths[index + 2]}`
    );
  }

  return `#set page(${PAGE_SETUP})
#v(${annual.cardStackTopGap})
#align(center)[
  #block(width: ${annual.cardWidth}, height: ${annual.cardHeight}, breakable: false)[
    #set block(spacing: ${zeroSpacing})
    #set par(spacing: ${zeroSpacing})
    #move(dy: ${annual.titleOffsetY})[#align(center)[#text(size: ${annual.titleFontSize}, weight: 900)[${year} CALENDAR]]]
    #v(${annual.titleBottomGap})
    #grid(
      columns: (1fr, ${annual.monthGap}, 1fr, ${annual.monthGap}, 1fr),
      rows: (${annual.monthHeight}, ${annual.monthHeight}, ${annual.monthHeight}, ${annual.monthHeight}),
      gutter: ${annual.gridGutter},
      align: top,
      ${rows.join(',\n      ')}
    )
  ]
]`;
}

function buildMonthlyCard(year: number, month: number, dayCells: CalendarCell[]): string {
  const { monthly, zeroSpacing } = typstLayout;
  const title = esc(
    new Date(year, month - 1, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' })
  );

  const weekdayHeaders = WEEKDAY_EN.map((label, index) => {
    const fill = index === 0 ? 'c-h' : index === 6 ? 'c-s' : 'c-w';
    return `table.cell(fill: ${fill}, inset: (y: ${monthly.weekdayInsetY}))[#align(center)[#text(fill: white, size: ${monthly.weekdayFontSize}, weight: 700)[${label}]]]`;
  }).join(',\n    ');

  const numRows = dayCells.length / 7;
  const rowH = `(${monthly.dateGridHeight} / ${numRows})`;
  const dateAreaH = `(${rowH} - ${monthly.holidayAreaHeight})`;
  const holidayAreaH = monthly.holidayAreaHeight;
  const rowsSpec = `(auto, ${Array(numRows).fill(rowH).join(', ')})`;

  const dateCells = dayCells
    .map((cell) => {
      const day = cell.date.getDate();
      const color = TYPST_COLOR[getCellColorType(cell)];
      const holidayName = escUnbreakable(cell.holidayName ?? '');
      const holidayLine = holidayName
        ? `[#pad(bottom: ${monthly.holidayPaddingBottom})[#align(center + bottom)[#block(width: auto, breakable: false, clip: false)[#text(fill: ${color}, size: ${monthly.holidayFontSize}, weight: 500)[${holidayName}]]]]]`
        : '[]';

      return `table.cell(inset: ${monthly.tableInset})[
        #block(height: ${rowH}, spacing: ${zeroSpacing}, clip: true)[
          #grid(
            columns: (1fr),
            rows: (${dateAreaH}, ${holidayAreaH}),
            gutter: ${monthly.gridGutter},
            [#pad(top: ${monthly.datePaddingTop}, left: ${monthly.datePaddingLeft})[#align(left + top)[#text(fill: ${color}, size: ${monthly.dateFontSize}, weight: 700)[${day}]]]],
            ${holidayLine}
          )
        ]
      ]`;
    })
    .join(',\n    ');

  return `#block(width: ${monthly.cardWidth}, height: ${monthly.cardHeight}, breakable: false)[
  #set align(center)
  #set block(spacing: ${zeroSpacing})
  #set par(spacing: ${zeroSpacing})
  #move(dy: ${monthly.titleOffsetY})[#pad(bottom: ${monthly.titlePaddingBottom})[#text(size: ${monthly.titleFontSize}, weight: 900)[${title}]]]
  #table(
    columns: (1fr,) * 7,
    rows: ${rowsSpec},
    stroke: ${monthly.tableStrokeWidth} + c-g,
    inset: ${monthly.tableInset},
    ${weekdayHeaders},
    ${dateCells}
  )
]`;
}

function buildMonthlyPages(year: number, monthGrids: YearGrid['monthGrids']): string {
  return buildMonthlyPageSources(year, monthGrids).join(`\n\n#pagebreak()\n\n`);
}

function buildMonthlyPageSources(year: number, monthGrids: YearGrid['monthGrids']): string[] {
  const { monthly } = typstLayout;
  const cards = monthGrids.map(({ month, dayCells }) => buildMonthlyCard(year, month, dayCells));

  const groups: string[] = [];
  for (let index = 0; index < 12; index += 3) {
    groups.push(
      `#align(center)[${cards[index]}]
#v(${monthly.cardStackGap})
#align(center)[${cards[index + 1]}]
#v(${monthly.cardStackGap})
#align(center)[${cards[index + 2]}]`
    );
  }

  return groups.map(
    (group) => `#set page(${PAGE_SETUP})\n\n#v(${monthly.cardStackTopGap})\n\n${group}`
  );
}

export function loadMergedHolidays(year: number): ReturnType<typeof loadHolidays> {
  return [-1, 0, 1]
    .map((delta) => loadHolidays(year + delta))
    .reduce<ReturnType<typeof loadHolidays>>((acc, holidays) => Object.assign(acc, holidays), {});
}

export function buildCalendarYearGrid(year: number): YearGrid {
  const normalizedYear = clampYear(year);
  return buildYearGrid(normalizedYear, loadMergedHolidays(normalizedYear));
}

export function buildTypstSource(yearGrid: YearGrid): string {
  const annualPage = buildAnnualPage(yearGrid.year, yearGrid.monthGrids);
  const monthlyPages = buildMonthlyPages(yearGrid.year, yearGrid.monthGrids);

  return `${TYPOGRAPHY_PREAMBLE}\n\n${annualPage}\n\n${monthlyPages}`;
}

export function buildTypstPageSources(yearGrid: YearGrid): string[] {
  const annualPage = buildAnnualPage(yearGrid.year, yearGrid.monthGrids);
  const monthlyPages = buildMonthlyPageSources(yearGrid.year, yearGrid.monthGrids);

  return [
    `${TYPOGRAPHY_PREAMBLE}\n\n${annualPage}`,
    ...monthlyPages.map((page) => `${TYPOGRAPHY_PREAMBLE}\n\n${page}`),
  ];
}
