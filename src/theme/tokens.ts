/**
 * Design Token System — PatenteHub
 *
 * Centralised, type-safe token definitions mapped to Tailwind class strings.
 * These are the single source of truth for all visual design decisions.
 *
 * ARCHITECTURE NOTES
 * ──────────────────
 * • Primitive tokens   → raw values (colors, spacing, radius)
 * • Semantic tokens    → purpose-named tokens (bg.card, text.primary)
 * • Component tokens   → pre-composed class strings for reuse in components
 *
 * All tokens map to Tailwind utility classes that resolve to the CSS custom
 * properties defined in src/index.css @theme block.  Because the surface scale
 * is inverted in `.dark`, most tokens work in both modes automatically.
 * Only tokens with `bg-white` need an explicit `dark:bg-surface-100` override.
 *
 * USAGE
 * ──────────────────
 * import { tokens, componentTokens } from '@/theme/tokens';
 *
 * // In a component:
 * <div className={cn(tokens.bg.card, tokens.border.default, tokens.radius.md)}>
 *
 * // Or use a pre-composed token:
 * <div className={componentTokens.card}>
 */

import { cn } from '@/shared/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE TOKENS
// ─────────────────────────────────────────────────────────────────────────────

/** Raw color scale references — prefer semantic tokens in components */
export const colorScale = {
  primary: {
    50:  'primary-50',
    100: 'primary-100',
    200: 'primary-200',
    300: 'primary-300',
    400: 'primary-400',
    500: 'primary-500',
    600: 'primary-600',
    700: 'primary-700',
    800: 'primary-800',
    900: 'primary-900',
  },
  surface: {
    50:  'surface-50',
    100: 'surface-100',
    200: 'surface-200',
    300: 'surface-300',
    400: 'surface-400',
    500: 'surface-500',
    600: 'surface-600',
    700: 'surface-700',
    800: 'surface-800',
    900: 'surface-900',
  },
} as const;

/** Spacing scale — maps to Tailwind's spacing scale */
export const spacing = {
  xs:   '2',   // 8px
  sm:   '3',   // 12px
  md:   '4',   // 16px
  lg:   '6',   // 24px
  xl:   '8',   // 32px
  '2xl':'12',  // 48px
} as const;

/** Border radius scale */
export const radius = {
  xs:   'rounded-lg',    // 8px
  sm:   'rounded-xl',    // 12px
  md:   'rounded-2xl',   // 16px
  lg:   'rounded-3xl',   // 24px
  full: 'rounded-full',
  // Component-specific aliases
  card:   'rounded-2xl',
  button: 'rounded-xl',
  input:  'rounded-xl',
  modal:  'rounded-2xl',
  badge:  'rounded-full',
  pill:   'rounded-full',
} as const;

/** Typography scale */
export const typography = {
  // Font sizes
  xs:   'text-xs',      // 12px
  sm:   'text-sm',      // 14px
  base: 'text-base',    // 16px
  lg:   'text-lg',      // 18px
  xl:   'text-xl',      // 20px
  '2xl':'text-2xl',     // 24px
  '3xl':'text-3xl',     // 30px

  // Heading styles (size + weight combined)
  h1: 'text-3xl font-black',
  h2: 'text-xl font-bold',
  h3: 'text-lg font-bold',
  h4: 'text-base font-semibold',
  h5: 'text-sm font-semibold',

  // Body styles
  body:    'text-sm leading-relaxed',
  caption: 'text-xs leading-tight',
  label:   'text-sm font-medium',
  mono:    'font-mono',

  // Weights
  normal:    'font-normal',
  medium:    'font-medium',
  semibold:  'font-semibold',
  bold:      'font-bold',
  black:     'font-black',
} as const;

/** Transition presets */
export const transition = {
  default:   'transition-all duration-200',
  colors:    'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  fast:      'transition-all duration-150',
  slow:      'transition-all duration-300',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC TOKENS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Semantic design tokens — the main API for building UI.
 * These automatically adapt between light and dark mode via CSS variables.
 */
export const tokens = {

  // ── Backgrounds ─────────────────────────────────────────────────────────
  bg: {
    /** Page / app shell background */
    page:      'bg-surface-50',
    /** Standard card / panel background */
    card:      'bg-white dark:bg-surface-100',
    /** Elevated card (second level) */
    elevated:  'bg-white dark:bg-surface-200',
    /** Subtle muted section (inside a card) */
    muted:     'bg-surface-100',
    /** Form input background */
    input:     'bg-white dark:bg-surface-100',
    /** Sidebar / nav background */
    nav:       'bg-white dark:bg-surface-100',
    /** Modal / dialog panel */
    modal:     'bg-white dark:bg-surface-100',
    /** Dark backdrop for modals */
    overlay:   'bg-black/50 backdrop-blur-sm',
    /** Success state background */
    success:   'bg-success-50 dark:bg-surface-200',
    /** Warning state background */
    warning:   'bg-warning-50 dark:bg-surface-200',
    /** Danger state background */
    danger:    'bg-danger-50 dark:bg-surface-200',
    /** Primary brand tint */
    primary:   'bg-primary-50 dark:bg-primary-900/30',
    /** Focus mode — deep dark bg for studying */
    focus:     'bg-surface-900 dark:bg-surface-50',
  },

  // ── Text ────────────────────────────────────────────────────────────────
  text: {
    /** High-contrast primary text */
    primary:    'text-surface-900',
    /** Body / secondary text */
    secondary:  'text-surface-700',
    /** De-emphasised / helper text */
    muted:      'text-surface-500',
    /** Placeholder / hint text */
    placeholder:'text-surface-400',
    /** White text (on coloured backgrounds) */
    inverse:    'text-white',
    /** Brand / link text */
    brand:      'text-primary-600',
    /** Success state text */
    success:    'text-success-600 dark:text-success-500',
    /** Warning state text */
    warning:    'text-warning-600 dark:text-warning-500',
    /** Danger state text */
    danger:     'text-danger-600 dark:text-danger-500',
  },

  // ── Borders ─────────────────────────────────────────────────────────────
  border: {
    /** Subtle divider — default for cards */
    default:  'border-surface-100',
    /** Medium border — inputs, form fields */
    medium:   'border-surface-200',
    /** Strong border — selected / active state */
    strong:   'border-surface-300',
    /** Focus state border */
    focus:    'border-primary-500',
    /** Brand border */
    brand:    'border-primary-600',
    /** Danger / error border */
    danger:   'border-danger-500',
    /** Success border */
    success:  'border-success-500',
  },

  // ── Radius (aliases from primitive) ─────────────────────────────────────
  radius,

  // ── Typography (aliases from primitive) ─────────────────────────────────
  type: typography,

  // ── Shadows ─────────────────────────────────────────────────────────────
  shadow: {
    none:      'shadow-none',
    sm:        'shadow-sm',
    card:      'shadow-sm',
    md:        'shadow-md',
    lg:        'shadow-lg',
    dropdown:  'shadow-lg',
    modal:     'shadow-2xl',
    /** Primary-coloured glow (buttons) — removed in dark mode */
    button:    'shadow-lg shadow-primary-200 dark:shadow-none',
    elevated:  'shadow-xl',
  },

  // ── Spacing ─────────────────────────────────────────────────────────────
  spacing: {
    card:    'p-4',
    cardLg:  'p-6',
    section: 'p-4 sm:p-6 lg:p-8',
    input:   'px-4 py-3',
  },

  // ── Focus ring ──────────────────────────────────────────────────────────
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900',

  // ── Transitions ─────────────────────────────────────────────────────────
  transition,

} as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT TOKENS
// Pre-composed class strings for each shared UI primitive.
// Import these in components to ensure design consistency.
// ─────────────────────────────────────────────────────────────────────────────

export const componentTokens = {

  // ── Card ─────────────────────────────────────────────────────────────────
  card: cn(
    tokens.bg.card,
    tokens.radius.card,
    'border',
    tokens.border.default,
    tokens.transition.colors,
  ),
  cardHoverable: cn(
    tokens.bg.card,
    tokens.radius.card,
    'border',
    tokens.border.default,
    tokens.transition.default,
    'hover:shadow-md hover:border-primary-100 dark:hover:border-primary-800',
  ),

  // ── Input ─────────────────────────────────────────────────────────────────
  input: cn(
    'w-full',
    tokens.spacing.input,
    tokens.radius.input,
    'border',
    tokens.border.medium,
    tokens.bg.input,
    tokens.text.primary,
    'placeholder:text-surface-400',
    tokens.focusRing,
    'focus:border-primary-500',
    tokens.transition.default,
  ),

  // ── Button variants ───────────────────────────────────────────────────────
  button: {
    base: cn(
      'inline-flex items-center justify-center font-semibold cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      tokens.transition.default,
    ),
    primary: cn(
      'bg-primary-600 text-white',
      'hover:bg-primary-700 active:bg-primary-800',
      tokens.shadow.button,
    ),
    secondary: cn(
      'bg-surface-100 text-surface-800',
      'hover:bg-surface-200 active:bg-surface-300',
    ),
    outline: cn(
      'border-2 border-primary-600 text-primary-600',
      'hover:bg-primary-50 active:bg-primary-100',
      'dark:hover:bg-primary-900 dark:active:bg-primary-800',
    ),
    ghost: cn(
      'text-surface-600',
      'hover:bg-surface-100 active:bg-surface-200',
    ),
    danger: cn(
      'bg-danger-500 text-white',
      'hover:bg-danger-600 active:bg-danger-600',
    ),
  },

  // ── Badge variants ────────────────────────────────────────────────────────
  badge: {
    default: 'bg-surface-100 text-surface-600',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200',
    success: 'bg-success-50  text-success-600 dark:bg-surface-200 dark:text-success-500',
    warning: 'bg-warning-50  text-warning-600 dark:bg-surface-200 dark:text-warning-500',
    danger:  'bg-danger-50   text-danger-600  dark:bg-surface-200 dark:text-danger-500',
    info:    'bg-blue-50     text-blue-700    dark:bg-blue-900    dark:text-blue-300',
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modal: cn(
    'relative w-full',
    tokens.bg.modal,
    tokens.radius.modal,
    tokens.shadow.modal,
    'flex flex-col max-h-[90vh] overflow-hidden',
    tokens.transition.colors,
  ),

  // ── Dropdown menu ─────────────────────────────────────────────────────────
  dropdown: cn(
    'absolute z-40 mt-1 min-w-[10rem]',
    tokens.bg.card,
    tokens.radius.sm,
    tokens.shadow.dropdown,
    'border',
    tokens.border.default,
    'py-1 overflow-hidden',
    tokens.transition.colors,
  ),

  // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebar: cn(
    tokens.bg.nav,
    'border-surface-100',
    tokens.transition.colors,
  ),

} as const;
