import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from './theme.css';

export const appShell = style({
  minHeight: '100vh',
  padding: '16px 12px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '20px 16px',
    },
    'screen and (min-width: 1024px)': {
      padding: '32px 24px',
    },
  },
});

export const appContainer = style({
  margin: '0 auto',
  maxWidth: '900px',
  '@media': {
    'screen and (min-width: 1024px)': {
      maxWidth: '1100px',
    },
  },
});

export const inlineErrorBanner = style({
  marginBottom: '16px',
  border: `1px solid ${vars.color.errorBorder}`,
  borderRadius: '14px',
  background: vars.color.errorBg,
  padding: '12px 14px',
  color: vars.color.error,
  fontSize: '0.9rem',
  fontWeight: 700,
});

export const panelState = style({
  display: 'flex',
  minHeight: '15rem',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '16px',
  textAlign: 'center',
});

export const panelStateLoading = style({
  color: vars.color.loadingText,
  fontSize: '0.95rem',
  fontWeight: 600,
});

export const panelErrorTitle = style({
  margin: 0,
  color: vars.color.error,
  fontSize: '0.95rem',
  fontWeight: 700,
});

export const panelErrorDetail = style({
  width: '100%',
  maxWidth: '100%',
  margin: 0,
  overflow: 'auto',
  borderRadius: '12px',
  background: vars.color.errorDetailBg,
  padding: '10px',
  color: vars.color.error,
  fontSize: '0.75rem',
  textAlign: 'left',
});

export const pageList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    'screen and (min-width: 768px)': {
      gap: '20px',
    },
  },
});

export const wasmSvgPageWrapper = style({
  display: 'block',
  width: '100%',
  overflow: 'hidden',
  border: `1px solid ${vars.color.pageBorder}`,
  borderRadius: '16px',
  background: vars.color.pageBg,
  boxShadow: `0 2px 8px rgb(15 23 42 / 0.08)`,
  aspectRatio: '210 / 297',
  '@media': {
    '(prefers-color-scheme: dark)': {
      boxShadow: '0 2px 8px rgb(0 0 0 / 0.4)',
    },
  },
});

// SVG child must be styled via globalStyle — vanilla-extract selectors cannot target descendants
globalStyle(`${wasmSvgPageWrapper} > svg`, {
  display: 'block',
  width: '100%',
  height: '100%',
});
