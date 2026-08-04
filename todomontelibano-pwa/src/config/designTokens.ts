/**
 * CAPISJ DIGITAL — Design tokens
 * Derived exclusively from CAPISJ_DIGITAL_logo_principal.svg
 *
 * Brand roles:
 *   Primary   → Navy wordmark  #021433
 *   Secondary → Teal "DIGITAL" #0BAD9A
 *   Accent    → Amber mascot   #F7AE51
 *   Info      → Sky blue       #0495DE
 */

export const LOGO_COLORS = {
  navy: '#021433',
  navyDeep: '#001332',
  navyAlt: '#031534',
  teal: '#0BAD9A',
  tealBright: '#04AE9D',
  sky: '#0495DE',
  amber: '#F7AE51',
  brown: '#A55F29',
  brownWarm: '#C9782C',
  ink: '#0C0A07',
  canvas: '#F9F9F9',
  white: '#FEFDFE',
  mist: '#F6F6F7',
  silver: '#D4D4D4',
} as const;

/** Primary = Navy (wordmark CAPISJ) */
export const primary = {
  50: '#F5F7FA',
  100: '#E6EBF2',
  200: '#C7D0DE',
  300: '#9AABC0',
  400: '#5C7190',
  500: '#334866',
  600: '#1E3250',
  700: '#12243C',
  800: '#0A182C',
  900: '#001332',
  950: '#021433',
  DEFAULT: '#021433',
} as const;

/** Secondary = Teal (DIGITAL lettering) */
export const secondary = {
  50: '#F0FAF8',
  100: '#D5F3EE',
  200: '#A8E5DB',
  300: '#6DD1C2',
  400: '#2FB8A7',
  500: '#0BAD9A',
  600: '#049A89',
  700: '#037A6D',
  800: '#055C53',
  900: '#064A43',
  950: '#042F2B',
  DEFAULT: '#0BAD9A',
} as const;

/** Accent = Amber (mascot energy / CTA) */
export const accent = {
  50: '#FFF9F0',
  100: '#FEEFDB',
  200: '#FCD9A8',
  300: '#FAC574',
  400: '#F8B85C',
  500: '#F7AE51',
  600: '#E8942A',
  700: '#C97418',
  800: '#A05A14',
  900: '#744212',
  950: '#4A2A0C',
  DEFAULT: '#F7AE51',
} as const;

/** Info = Sky blue (logo digital accent) */
export const info = {
  50: '#F0F8FC',
  100: '#D6ECF8',
  200: '#A8D7F0',
  300: '#5CB8E8',
  400: '#1A9FE0',
  500: '#0495DE',
  600: '#0378B3',
  700: '#025D8C',
  800: '#024566',
  900: '#032F45',
  950: '#021C29',
  DEFAULT: '#0495DE',
} as const;

/** Semantic — harmonized with logo (teal / amber / sky / warm red-brown) */
export const semantic = {
  success: {
    DEFAULT: '#0BAD9A',
    soft: '#D5F3EE',
    strong: '#037A6D',
  },
  warning: {
    DEFAULT: '#F7AE51',
    soft: '#FEEFDB',
    strong: '#C97418',
  },
  error: {
    DEFAULT: '#C44A2A',
    soft: '#FCE8E3',
    strong: '#8F2F18',
  },
  info: {
    DEFAULT: '#0495DE',
    soft: '#D6ECF8',
    strong: '#025D8C',
  },
} as const;

/** Surfaces & text — light / dark */
export const surfaces = {
  light: {
    background: '#F9F9F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FEFDFE',
    border: '#E2E4E9',
    borderStrong: '#D4D4D4',
    text: '#0C0A07',
    textMuted: '#5C7190',
    textInverse: '#FEFDFE',
  },
  dark: {
    background: '#021433',
    surface: '#0A182C',
    surfaceElevated: '#12243C',
    border: '#1E3250',
    borderStrong: '#334866',
    text: '#F5F7FA',
    textMuted: '#9AABC0',
    textInverse: '#021433',
  },
} as const;

/** PWA chrome */
export const pwa = {
  themeColor: '#021433',
  themeColorDark: '#021433',
  backgroundColor: '#F9F9F9',
} as const;
