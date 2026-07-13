import { style } from '@vanilla-extract/css';
import { vars } from './theme.css';

export const appHeader = style({
  marginBottom: '20px',
  border: `1px solid ${vars.color.border}`,
  borderRadius: '20px',
  background: vars.color.surface,
  boxShadow: `0 4px 16px rgb(15 23 42 / 0.08)`,
  backdropFilter: 'blur(14px)',
  padding: '16px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '20px',
      marginBottom: '24px',
    },
    'screen and (min-width: 1024px)': {
      padding: '24px',
    },
    '(prefers-color-scheme: dark)': {
      boxShadow: '0 4px 16px rgb(0 0 0 / 0.3)',
    },
  },
});

export const appHeaderRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '16px',
  flexDirection: 'column',
  '@media': {
    'screen and (min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'center',
      gap: '24px',
    },
  },
});

export const appTitle = style({
  margin: 0,
  fontSize: 'clamp(1.6rem, 5vw, 2.8rem)',
  lineHeight: 0.95,
  fontWeight: 800,
  letterSpacing: '-0.04em',
});

export const appActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  '@media': {
    'screen and (min-width: 640px)': {
      width: 'auto',
      justifyContent: 'flex-end',
      gap: '12px',
    },
  },
});

export const yearControls = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  '@media': {
    'screen and (min-width: 640px)': {
      flexWrap: 'nowrap',
      gap: '12px',
    },
  },
});

export const yearInputLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: vars.color.textMuted,
});

export const yearInputPrefix = style({
  order: 2,
});

export const yearInput = style({
  width: '7rem',
  padding: '9px 12px',
  border: `1px solid ${vars.color.inputBorder}`,
  borderRadius: '12px',
  background: vars.color.inputBg,
  color: vars.color.text,
  textAlign: 'center',
  transition: 'border-color 120ms ease',
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: vars.color.primary,
    },
  },
});

export const stepperGroup = style({
  display: 'flex',
  overflow: 'hidden',
  border: `1px solid ${vars.color.inputBorder}`,
  borderRadius: '12px',
  background: vars.color.inputBg,
});

export const stepperButton = style({
  padding: '9px 14px',
  border: 0,
  background: 'transparent',
  color: vars.color.textMuted,
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background-color 120ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.stepperHover,
    },
  },
});

export const stepperDivider = style({
  width: '1px',
  background: vars.color.inputBorder,
});

export const actionButton = style({
  padding: '9px 16px',
  border: 0,
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background-color 120ms ease, opacity 120ms ease',
  background: vars.color.primary,
  selectors: {
    '&:hover': {
      background: vars.color.primaryHover,
    },
    '&:disabled': {
      cursor: 'wait',
      opacity: 0.6,
    },
  },
});
