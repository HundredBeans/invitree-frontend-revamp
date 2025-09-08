# Theme Registry System

## Overview
The theme registry system provides a centralized way to manage and render theme components dynamically. This system is built into the existing `src/themes/index.ts` file and makes it easy to add new themes without modifying multiple files while ensuring consistent theme rendering across the application.

## Key Features

### 🎯 **Dynamic Theme Rendering**
- **Centralized Registry**: All theme components are registered in one place
- **Dynamic Loading**: Themes are rendered based on slug without hardcoded conditionals
- **Fallback Handling**: Graceful fallback for unknown or unavailable themes

### 📝 **Type Safety**
- **Consistent Props**: All theme components use the same `ThemeComponentProps` interface
- **Type Checking**: TypeScript ensures proper component registration and usage

### 🔧 **Easy Maintenance**
- **Single Source of Truth**: Add new themes by updating only the registry
- **Scalable**: No need to modify preview components when adding themes
- **Consistent**: All themes follow the same interface and patterns

## File Structure

### `themes/index.ts`
Main registry file containing:
- `ThemeComponentProps` - Standard props interface for all themes
- `THEME_COMPONENTS` - Registry mapping theme slugs to components
- `getThemeComponent()` - Get theme component by slug
- `renderThemeComponent()` - Render theme with fallback handling
- `isThemeAvailable()` - Check if theme is available
- `getAvailableThemeSlugs()` - Get list of available themes

## Usage

### Rendering Themes
```typescript
// In preview components
import { renderThemeComponent, isThemeAvailable } from "@/themes";

// Check if theme is available
if (isThemeAvailable(themeSlug)) {
  // Render theme dynamically
  const themeElement = renderThemeComponent(themeSlug, {
    invitation,
    formData,
    invitationTitle,
    invitationUrl,
    isEditable,
    onFieldClick
  });
}
```

### Getting Theme Components
```typescript
import { getThemeComponent } from "@/themes";

// Get theme component directly
const ThemeComponent = getThemeComponent("wedding-classic");
if (ThemeComponent) {
  return <ThemeComponent {...props} />;
}
```

## Adding New Themes

### Step 1: Create Theme Component
Create your theme component following the standard interface:

```typescript
// src/themes/my-new-theme.tsx
import React from "react";
import { useEditableElement } from "@/components/editable-wrapper";
import type { Invitation } from "@/types/invitation";

interface MyNewThemeProps {
  invitation: Invitation;
  formData?: Record<string, Record<string, string>>;
  invitationTitle?: string;
  invitationUrl?: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
}

export function MyNewTheme({
  invitation,
  formData,
  invitationTitle,
  invitationUrl,
  isEditable = false,
  onFieldClick
}: MyNewThemeProps) {
  const createEditableElement = useEditableElement(isEditable, onFieldClick);
  
  // Your theme implementation here
  return (
    <div className="my-new-theme">
      {/* Theme content */}
    </div>
  );
}
```

### Step 2: Register Theme
Add your theme to the registry:

```typescript
// src/themes/index.ts
import { MyNewTheme } from './my-new-theme';

export const THEME_COMPONENTS: Record<string, ThemeComponent> = {
  "wedding-classic": WeddingClassicTheme,
  "wedding-ornamental": WeddingOrnamentalTheme,
  "my-new-theme": MyNewTheme, // Add your theme here
};
```

### Step 3: Create Strapi Theme Entry
Create the theme in Strapi admin with:
- `themeName`: "My New Theme"
- `slug`: "my-new-theme" (must match registry key)
- `invitationType`: "wedding" or "event"
- `structure_blueprint`: JSON defining form fields

### Step 4: Test Theme
The theme will automatically be available in:
- Theme selection page (filtered by invitation type)
- Preview components (rendered dynamically)
- Editor interface (with live preview)

## Current Registered Themes

### Wedding Themes
- **wedding-classic**: Classic wedding theme with elegant design
- **wedding-ornamental**: Ornamental theme with rich decorations and animations

### Event Themes
- *None currently registered*

## Theme Component Interface

### Required Props
```typescript
interface ThemeComponentProps {
  invitation: Invitation;           // Full invitation data
  formData?: InvitationContent;     // Form data for live editing
  invitationTitle?: string;         // Override title
  invitationUrl?: string;           // Invitation URL
  isEditable?: boolean;             // Enable click-to-edit
  onFieldClick?: (section: string, field: string) => void; // Edit handler
}
```

### Standard Patterns
All theme components should:
1. **Use `useEditableElement` hook** for click-to-edit functionality
2. **Handle missing data gracefully** with fallbacks
3. **Support both form data and invitation data** for flexibility
4. **Follow responsive design principles** for all screen sizes
5. **Include proper TypeScript types** for all props and data

## Integration Points

### Preview Components
- `InvitationPreview` uses the registry for dynamic rendering
- Automatic fallback for unknown themes
- Consistent props across all themes

### Theme Selection
- Themes are filtered by `invitationType` in the new invitation page
- Registry provides available theme validation

### Editor Interface
- Live preview uses registry for real-time updates
- Click-to-edit functionality works across all registered themes

## Benefits

### For Developers
- **Easy Theme Addition**: Just create component and register it
- **Consistent Interface**: All themes use the same props and patterns
- **Type Safety**: TypeScript ensures proper implementation
- **Maintainable**: Changes to one theme don't affect others

### For Users
- **Reliable Experience**: Consistent behavior across all themes
- **Graceful Fallbacks**: No broken pages for missing themes
- **Live Preview**: Real-time updates work with all themes

## Future Enhancements

### Planned Features
- **Lazy Loading**: Load theme components only when needed
- **Theme Categories**: Better organization of themes by category
- **Theme Validation**: Automatic validation of theme components
- **Hot Reloading**: Development-time theme reloading

### Potential Improvements
- **Plugin System**: Allow external theme plugins
- **Theme Inheritance**: Base themes with variations
- **Performance Optimization**: Bundle splitting for themes
- **Theme Analytics**: Track theme usage and performance
