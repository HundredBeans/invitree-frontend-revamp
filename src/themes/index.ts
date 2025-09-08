// Theme exports
export { WeddingClassicTheme } from './wedding-classic-theme';
export { WeddingOrnamentalTheme } from './wedding-ornamental-theme';

import React from "react";
import { WeddingClassicTheme } from './wedding-classic-theme';
import { WeddingOrnamentalTheme } from './wedding-ornamental-theme';
import type { Invitation, InvitationContent } from "@/types/invitation";

// Theme component props interface
export interface ThemeComponentProps {
  invitation: Invitation;
  formData?: InvitationContent;
  invitationTitle?: string;
  invitationUrl?: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
}

// Theme component type
export type ThemeComponent = React.ComponentType<ThemeComponentProps>;

// Theme registry - add new themes here
export const AVAILABLE_THEMES = {
  'wedding-classic': {
    name: 'Wedding Classic',
    component: 'WeddingClassicTheme',
    description: 'A classic wedding theme with elegant design and comprehensive wedding sections',
    category: 'wedding',
    preview: '/themes/wedding-classic-preview.jpg'
  },
  'wedding-ornamental': {
    name: 'Wedding Ornamental',
    component: 'WeddingOrnamentalTheme',
    description: 'An ornamental wedding theme with rich decorations, elegant animations, and luxurious design elements',
    category: 'wedding',
    preview: '/themes/wedding-ornamental-preview.jpg'
  }
} as const;

export type ThemeKey = keyof typeof AVAILABLE_THEMES;

// Theme component registry mapping theme slugs to actual components
export const THEME_COMPONENTS: Record<string, ThemeComponent> = {
  "wedding-classic": WeddingClassicTheme,
  "wedding-ornamental": WeddingOrnamentalTheme,
};

/**
 * Get theme component by slug
 * @param slug Theme slug
 * @returns Theme component or null if not found
 */
export function getThemeComponent(slug: string): ThemeComponent | null {
  return THEME_COMPONENTS[slug] || null;
}

/**
 * Render theme component dynamically
 * @param slug Theme slug
 * @param props Theme component props
 * @returns Rendered theme component or fallback
 */
export function renderThemeComponent(
  slug: string,
  props: ThemeComponentProps
): React.ReactElement {
  const ThemeComponent = getThemeComponent(slug);

  if (!ThemeComponent) {
    // Fallback for unknown themes - return a simple fallback component
    const FallbackComponent: ThemeComponent = () => React.createElement(
      'div',
      { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('h2', { className: 'text-2xl font-semibold text-gray-800 mb-4' }, 'Theme Not Available'),
        React.createElement('p', { className: 'text-gray-600' }, `The theme "${slug}" is not currently available.`)
      )
    );
    return React.createElement(FallbackComponent, props);
  }

  return React.createElement(ThemeComponent, props);
}

/**
 * Check if a theme is available
 * @param slug Theme slug
 * @returns True if theme is available
 */
export function isThemeAvailable(slug: string): boolean {
  return slug in THEME_COMPONENTS;
}

/**
 * Get all available theme slugs
 * @returns Array of available theme slugs
 */
export function getAvailableThemeSlugs(): string[] {
  return Object.keys(THEME_COMPONENTS);
}
