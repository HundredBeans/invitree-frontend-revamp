# Wedding Invitation Themes

This directory contains wedding invitation themes for the Invitree application.

## Elegant Garden Theme

A beautiful wedding invitation theme with elegant typography and garden-inspired colors.

### Features

- **Elegant Typography**: Uses Playfair Display (serif), Dancing Script (script), and Inter (sans-serif) fonts
- **Garden-Inspired Colors**: Green and rose color palette with soft gradients
- **Responsive Design**: Works beautifully on all device sizes
- **Accessibility**: Includes focus states, high contrast support, and reduced motion support
- **Print-Friendly**: Optimized styles for printing invitations

### Sections Included

1. **Cover Section**: Main wedding title, couple names, and invitation text
2. **Opening Section**: Quote or personal message with decorative elements
3. **Profile Section**: Individual profiles for bride and groom with photos and details
4. **Schedule Section**: Wedding ceremony and reception details with dates, times, and locations
5. **Media Section**: Photo gallery with captions

### Usage

```tsx
import { ElegantGardenTheme } from '@/themes';

function WeddingInvitation({ formData, invitationTitle, invitationUrl }) {
  return (
    <ElegantGardenTheme 
      formData={formData}
      invitationTitle={invitationTitle}
      invitationUrl={invitationUrl}
    />
  );
}
```

### Structure Blueprint

The theme uses a structure blueprint that defines form fields for each section:

```json
{
  "sections": [
    {
      "id": "cover",
      "name": "Cover Section",
      "fields": [
        {
          "id": "title",
          "label": "Wedding Title",
          "type": "text",
          "required": true
        }
        // ... more fields
      ]
    }
    // ... more sections
  ]
}
```

### Backend Integration

To use this theme with the backend:

1. **Create Theme in Strapi**: Use the structure blueprint JSON to create a new theme entry
2. **Set Theme Properties**:
   - `themeName`: "Elegant Garden Wedding"
   - `slug`: "elegant-garden-wedding"
   - `invitationType`: "wedding"
   - `structure_blueprint`: Use the JSON from `elegant-garden-structure-blueprint.json`

### Customization

The theme uses CSS custom properties for easy customization:

```css
.elegant-garden-theme {
  --color-primary-green: #059669;
  --color-primary-rose: #e11d48;
  --font-serif: 'Playfair Display', serif;
  --font-script: 'Dancing Script', cursive;
  --font-sans: 'Inter', sans-serif;
}
```

### Files Structure

```
themes/
├── elegant-garden-theme.tsx          # Main React component
├── elegant-garden-theme.css          # Custom styles
├── elegant-garden-structure-blueprint.json  # Form field definitions
├── elegant-garden-sample-data.json   # Sample data for testing
├── index.ts                          # Theme exports
└── README.md                         # This file
```

## Adding New Themes

To add a new theme:

1. Create a new theme component file (e.g., `modern-minimalist-theme.tsx`)
2. Create corresponding CSS file for custom styles
3. Create structure blueprint JSON file
4. Add theme to `index.ts` exports
5. Update `AVAILABLE_THEMES` registry

### Theme Component Interface

```tsx
interface ThemeProps {
  formData: InvitationContent;
  invitationTitle: string;
  invitationUrl: string;
}
```

### Best Practices

- Use semantic HTML elements for accessibility
- Include proper alt text for images
- Support keyboard navigation
- Test with screen readers
- Ensure good color contrast ratios
- Make responsive for mobile devices
- Include print styles
- Support reduced motion preferences

## Testing

Use the sample data file to test themes:

```tsx
import sampleData from './elegant-garden-sample-data.json';

<ElegantGardenTheme 
  formData={sampleData.sampleContent}
  invitationTitle="Sample Wedding"
  invitationUrl="sample-wedding"
/>
```
