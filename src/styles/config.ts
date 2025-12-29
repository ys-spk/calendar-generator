import type { UserShortcuts } from '@unocss/core';
import { clsx } from 'clsx';
import type { Theme } from 'unocss/preset-wind4';

export const theme: Theme = {
  colors: {
    holiday: 'var(--colors-red-500)',
    saturday: 'var(--colors-blue-700)',
    weekday: 'var(--colors-black)',
    'out-of-month': 'var(--colors-neutral-300)',
    'common-grid': 'var(--colors-neutral-300)',
  },
  spacing: {
    'common-width': '140mm',
    'annual-height': '160mm',
    'monthly-height': '80mm',
  },
  text: {
    'annual-title': { fontSize: '10mm' },
    'annual-month-label': { fontSize: '7mm' },
    'annual-weekday': { fontSize: '3mm' },
    'annual-date': { fontSize: '3.5mm' },
    'monthly-title': { fontSize: '8mm' },
    'monthly-weekday': { fontSize: '3.5mm' },
    'monthly-date': { fontSize: '5.5mm' },
    'monthly-holiday': { fontSize: '2.75mm' },
  },
};

export const shortcuts: UserShortcuts<Theme> = [
  [
    'calendar-card',
    clsx(
      'color-black mt-6 break-inside-avoid overflow-hidden rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm',
      'print:break-inside-avoid-page print:border-0 print:shadow-none'
    ),
  ],
  ['annual-grid-cols', `grid-cols-[repeat(7,1fr)${'_0.75fr_repeat(7,1fr)'.repeat(2)}_0]`],
  ['annual-grid-rows', `grid-rows-[auto${'_auto_auto_repeat(6,1fr)'.repeat(4)}]`],
  [/^bo-(.*)$/, ([, c]) => `border-${c} outline-${c}`],
];
