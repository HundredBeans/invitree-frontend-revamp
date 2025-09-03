// Theme exports
export { WeddingClassicTheme } from './wedding-classic-theme';

// Theme registry - add new themes here
export const AVAILABLE_THEMES = {
  'wedding-classic': {
    name: 'Wedding Classic',
    component: 'WeddingClassicTheme',
    description: 'A classic wedding theme with elegant design and comprehensive wedding sections',
    category: 'wedding',
    preview: '/themes/wedding-classic-preview.jpg'
  }
} as const;

export type ThemeKey = keyof typeof AVAILABLE_THEMES;
