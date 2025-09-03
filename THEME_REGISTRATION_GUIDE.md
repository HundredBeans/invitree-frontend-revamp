# Theme Development & Registration Guide

This guide explains how to create new themes and register them in your Strapi admin dashboard using the new scalable architecture.

## Overview

Themes in Invitree are React components that render invitation content with automatic click-to-edit functionality in the editor. The new architecture uses the `EditableWrapper` component to provide consistent editing behavior across all themes, making theme development extremely simple and scalable.

## Architecture Components

1. **EditableWrapper**: `src/components/editable-wrapper.tsx` - Reusable component that provides click-to-edit functionality
2. **useEditableElement Hook**: Convenient hook for creating editable elements in themes
3. **Theme Components**: `src/themes/` - React components that render invitation content
4. **Example Theme**: `src/themes/example-new-theme.tsx` - Shows how easy it is to create new themes
5. **Editor Integration**: Floating editor panel with automatic section expansion and field focusing

## Creating a New Theme

### 1. Theme Component Structure

Create a new theme component in `src/themes/your-theme-name.tsx`:

```tsx
"use client";

import React from "react";
import { useEditableElement } from "@/components/editable-wrapper";
import type { Invitation } from "@/types/invitation";

interface YourThemeProps {
  invitation: Invitation;
  formData?: Record<string, Record<string, string>>;
  invitationTitle?: string;
  invitationUrl?: string;
  isEditable?: boolean;
  onFieldClick?: (section: string, field: string) => void;
}

export function YourTheme({
  invitation,
  formData,
  invitationTitle,
  invitationUrl,
  isEditable = false,
  onFieldClick
}: YourThemeProps) {
  // Get the editable element creator - handles all click-to-edit logic
  const createEditableElement = useEditableElement(isEditable, onFieldClick);

  // Helper function to get field values
  const getValue = (path: string): string => {
    const [section, field] = path.split('.');
    return formData?.[section]?.[field] || "";
  };

  return (
    <div className="your-theme-styles">
      {/* Make any content editable by wrapping it */}
      {createEditableElement(
        "cover",           // section name
        "title",           // field name
        getValue("cover.title") || invitationTitle || "Default Title",
        "text-4xl font-bold text-center" // CSS classes
      )}

      {/* More editable elements... */}
    </div>
  );
}
```

### 2. Key Features

- **No Boilerplate**: Just import `useEditableElement` and use it
- **Automatic Click-to-Edit**: Elements become clickable when `isEditable={true}`
- **Consistent UX**: All themes get the same editing experience
- **Pure Presentation**: Themes focus only on styling and layout

## Step-by-Step Registration

### 1. Update Preview Component

Add your theme to the preview component in `src/components/invitation-preview.tsx`:

```tsx
// Import your theme
import { YourTheme } from "@/themes/your-theme-name";

// Add to the theme rendering logic
{invitation.invitationType === "YourType" && invitation.theme?.slug === "your-theme-slug" ? (
  <div className={viewport === "desktop" ? "border rounded-lg overflow-hidden" : "overflow-hidden"}>
    <YourTheme
      invitation={invitation}
      formData={formData}
      invitationTitle={invitationTitle}
      invitationUrl={invitationUrl}
      isEditable={isEditable}
      onFieldClick={onFieldClick}
    />
  </div>
) : (
  // fallback to simple preview
)}
```

### 2. Access Strapi Admin Dashboard

1. Start your Strapi backend server
2. Navigate to `http://localhost:1337/admin` (or your Strapi URL)
3. Log in with your admin credentials

### 3. Navigate to Themes Collection

1. In the left sidebar, find and click on **"Themes"** under Content Manager
2. Click **"Create new entry"** button

### 4. Fill in Theme Details

Fill in the following fields:

#### Basic Information
- **Theme Name**: `Your Theme Name`
- **Slug**: `your-theme-slug` (this must match the slug check in the preview component)
- **Thumbnail URL**: `https://placehold.co/800x600/F43F5E/FFFFFF?text=Your+Theme`
- **Invitation Type**: Select appropriate type (e.g., `wedding`, `birthday`, etc.)
- **Structure Blueprint**: Leave this empty `{}` or omit entirely (not needed anymore)

### 5. Save and Publish

1. Click **"Save"** to create the theme entry
2. Click **"Publish"** to make it available for use

## Click-to-Edit Architecture

### How It Works

1. **EditableWrapper Component**: Handles all click-to-edit logic
   - Hover effects (blue outline, "Edit" badge)
   - Click handlers that trigger editor panel
   - Only active when `isEditable={true}`

2. **useEditableElement Hook**: Simplifies theme development
   - Returns a function to create editable elements
   - Handles all the wrapper logic automatically
   - Clean API: `createEditableElement(section, field, content, className)`

3. **Editor Integration**: Seamless editing experience
   - Click any text → floating editor opens
   - Relevant section expands automatically
   - Field gets focused with blue highlight
   - Live preview updates in real-time

### Data Flow

1. **Form Data**: Editor form data takes priority for live editing
2. **typeSpecificDetails**: Fallback data from invitation structure
3. **Live Updates**: Changes reflect immediately in preview
4. **Auto-Save**: Changes are saved when user clicks save button

### Theme Component Features

Modern themes include:

- **Click-to-Edit**: Any text can be made editable with one line
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Accessibility**: Semantic HTML and proper ARIA labels
- **Performance**: Optimized rendering with React best practices
- **Consistency**: Same editing experience across all themes

## Testing the Theme

### 1. Create a Test Invitation

1. In Strapi admin, go to **Invitations**
2. Create a new invitation with:
   - **Invitation Type**: Match your theme's target type
   - **Theme**: Select your newly created theme
   - **Type Specific Details**: Add appropriate data structure

### 2. Test in Editor

1. Navigate to the invitation editor in your frontend
2. You should see:
   - Full-width preview using your theme
   - Click-to-edit functionality on all wrapped elements
   - Floating editor panel that opens when clicking text
   - Automatic section expansion and field focusing
   - Real-time updates as you edit fields

### 3. Test Click-to-Edit Features

1. **Hover Effects**: Hover over editable text to see blue outline and "Edit" badge
2. **Click to Edit**: Click any editable text to open the editor panel
3. **Auto-Focus**: The relevant field should be focused and highlighted
4. **Live Updates**: Changes should appear immediately in the preview
5. **Viewport Switching**: Test mobile, tablet, and desktop views

## Troubleshooting

### Theme Not Showing in Preview

- Check that the theme slug matches exactly in both Strapi and preview component
- Verify the invitation type matches your theme's target type
- Ensure the theme is imported and added to the preview component
- Check browser console for any import errors

### Click-to-Edit Not Working

- Verify `isEditable={true}` is passed to the theme component
- Check that `onFieldClick` handler is provided
- Ensure elements are wrapped with `createEditableElement()`
- Test that the EditableWrapper component is imported correctly

### Editor Panel Issues

- Check that field IDs match the section-field pattern (`section-field`)
- Verify the floating editor sections are properly configured
- Ensure the field focus logic is working (check browser console)
- Test that section expansion is working correctly

### Styling Issues

- Check that Tailwind CSS classes are properly configured
- Verify responsive breakpoints work on different screen sizes
- Test hover effects and edit indicators
- Ensure click areas are properly sized for touch devices

## Advanced Customization

### Adding New Editable Fields

1. **In Theme Component**: Wrap new content with `createEditableElement()`
   ```tsx
   {createEditableElement(
     "newSection",
     "newField",
     getValue("newSection.newField") || "Default Value",
     "your-css-classes"
   )}
   ```

2. **In Editor Form**: Add corresponding form fields in the floating editor
3. **In Data Structure**: Ensure `typeSpecificDetails` includes the new field

### Custom Edit Behavior

You can customize the EditableWrapper behavior:

```tsx
// Custom wrapper with different styling
<EditableWrapper
  section="custom"
  field="field"
  isEditable={isEditable}
  onFieldClick={onFieldClick}
  className="custom-hover-effect"
>
  <YourCustomContent />
</EditableWrapper>
```

### Styling Changes

1. **Theme Styles**: Modify Tailwind classes in your theme component
2. **Edit Indicators**: Customize hover effects in EditableWrapper
3. **Responsive Design**: Test on all viewport sizes
4. **Accessibility**: Maintain proper contrast and focus indicators

## Best Practices

### Theme Development

1. **Keep It Simple**: Focus on presentation, let EditableWrapper handle interactions
2. **Responsive First**: Design for mobile, enhance for desktop
3. **Graceful Degradation**: Handle missing data elegantly
4. **Performance**: Optimize images and minimize re-renders
5. **Accessibility**: Use semantic HTML and proper ARIA labels

### Code Organization

```tsx
// Good: Clean, focused theme component
export function MyTheme({ isEditable, onFieldClick, ...props }) {
  const createEditableElement = useEditableElement(isEditable, onFieldClick);

  return (
    <div>
      {createEditableElement("section", "field", content, "classes")}
    </div>
  );
}

// Avoid: Mixing presentation with interaction logic
// The EditableWrapper handles all interaction logic for you
```

### Testing Checklist

- [ ] Theme renders correctly in preview
- [ ] All text elements are clickable when `isEditable={true}`
- [ ] Hover effects work properly
- [ ] Editor panel opens and focuses correct fields
- [ ] Live updates work in real-time
- [ ] Responsive design works on all viewports
- [ ] Theme works with missing/empty data
- [ ] Performance is acceptable with large content

## Production Deployment

### Before Going Live

1. **Comprehensive Testing**: Test with various data combinations and edge cases
2. **Cross-Browser Testing**: Verify compatibility across different browsers
3. **Device Testing**: Test on actual mobile devices, not just browser dev tools
4. **Accessibility Audit**: Use tools like axe-core or Lighthouse
5. **Performance Testing**: Check loading times and runtime performance
6. **User Testing**: Get feedback from actual users

### SEO & Accessibility

Modern themes should include:
- Semantic HTML structure (`<header>`, `<main>`, `<section>`, etc.)
- Proper heading hierarchy (`h1` → `h2` → `h3`)
- Alt text for images and decorative elements
- Sufficient color contrast ratios
- Keyboard navigation support
- Screen reader compatibility

## Support & Resources

### Documentation

- **EditableWrapper API**: See `src/components/editable-wrapper.tsx`
- **Example Theme**: Check `src/themes/example-new-theme.tsx`
- **Wedding Theme**: Reference implementation in `src/themes/wedding-classic-theme.tsx`

### Common Issues

1. **Import Errors**: Ensure all imports are correct and components exist
2. **TypeScript Errors**: Check prop types match the expected interfaces
3. **Styling Issues**: Verify Tailwind classes are available and properly applied
4. **Click-to-Edit Not Working**: Check `isEditable` prop and `onFieldClick` handler

### Getting Help

If you encounter issues:

1. Check browser console for JavaScript/TypeScript errors
2. Verify all required props are passed to theme components
3. Test with minimal data first, then add complexity
4. Use React DevTools to inspect component props and state
5. Check network requests to ensure data is loading correctly

The new architecture is designed to be developer-friendly and robust, making theme creation straightforward and maintainable.
