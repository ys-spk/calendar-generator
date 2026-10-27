import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

/**
 * CSS custom properties — light mode defaults, overridden by dark mode media query.
 * All consuming styles reference these vars so dark mode "just works".
 */
export const vars = createGlobalTheme(':root', {
  color: {
    bg: '#f3f4f6',
    surface: 'rgba(255, 255, 255, 0.88)',
    border: '#dbe4ee',
    text: '#0f172a',
    textMuted: '#334155',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    error: '#b91c1c',
    errorBg: '#fff1f2',
    errorBorder: '#fecaca',
    errorDetailBg: '#fef2f2',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    stepperHover: '#f1f5f9',
    pageBg: '#ffffff',
    pageBorder: '#dbe4ee',
    loadingText: '#94a3b8',
  },
});

globalStyle(':root', {
  colorScheme: 'light',
  '@media': {
    '(prefers-color-scheme: dark)': {
      colorScheme: 'dark',
      vars: {
        [vars.color.bg]: '#0f172a',
        [vars.color.surface]: 'rgba(15, 23, 42, 0.9)',
        [vars.color.border]: '#334155',
        [vars.color.text]: '#f1f5f9',
        [vars.color.textMuted]: '#cbd5e1',
        [vars.color.primary]: '#6366f1',
        [vars.color.primaryHover]: '#818cf8',
        [vars.color.error]: '#fca5a5',
        [vars.color.errorBg]: '#450a0a',
        [vars.color.errorBorder]: '#7f1d1d',
        [vars.color.errorDetailBg]: '#3b0000',
        [vars.color.inputBg]: '#1e293b',
        [vars.color.inputBorder]: '#475569',
        [vars.color.stepperHover]: '#334155',
        [vars.color.pageBg]: '#1e293b',
        [vars.color.pageBorder]: '#334155',
        [vars.color.loadingText]: '#64748b',
      },
    },
  },
});

globalStyle('body', {
  margin: 0,
  color: vars.color.text,
  background: vars.color.bg,
});
