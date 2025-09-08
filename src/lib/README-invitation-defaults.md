# Invitation Default Data System

## Overview
The invitation default data system provides pre-populated, generic default values for new invitations based on their type. This ensures that users start with meaningful content that they can easily customize rather than empty fields.

## Key Features

### 🎯 **Type-Based Defaults**
- **Wedding Invitations**: Complete wedding-specific data including bride/groom details, ceremony/reception events
- **Event Invitations**: Generic event data suitable for any type of celebration

### 📝 **Comprehensive Default Data**
Each invitation type includes:
- **Cover Section**: Title, subtitle, header, and subheader text
- **Opening Section**: Inspirational quotes, placeholder images, and decoration URLs
- **Event Details**: Default event names, dates, times, and locations
- **Participant Details**: Placeholder information for key people (bride/groom, celebrant, etc.)
- **Additional Notes**: Generic but meaningful messages for guests

### 🖼️ **Placeholder Images**
- **Consistent placeholder images** using `via.placeholder.com`
- **Color-coded placeholders** for different roles (blue for groom, pink for bride)
- **Appropriate sizing** for different use cases (300x300 for profiles, 600x400 for photos)

## File Structure

### `invitation-defaults.ts`
Main utility file containing:
- `getDefaultInvitationData()` - Returns complete default data for invitation types
- `INVITATION_TYPE_DEFAULTS` - Constants for titles, themes, and venues
- `getRandomDefaultTitle()` - Generates random default titles
- `getRandomDefaultVenue()` - Generates random default venues

### Sample Data Files
- `wedding-classic-sample-data.json` - Wedding Classic theme with defaults
- `wedding-ornamental-sample-data.json` - Wedding Ornamental theme with defaults
- `wedding-default-template.json` - Comprehensive template for multiple invitation types

## Usage

### Creating New Invitations
```typescript
// The createInvitation function now accepts invitation type
const newInvitation = await createInvitation(
  themeId, 
  userId, 
  jwt, 
  "Wedding" // or "Event"
);
```

### Default Data Structure
```typescript
interface DefaultInvitationData {
  invitationTitle: string;
  eventDate: string;
  typeSpecificDetails: any[];
}
```

## Wedding Defaults

### Cover Section
- **Title**: "Bride & Groom"
- **Subtitle**: "Together Forever"
- **Header**: "The Wedding of"
- **Subheader**: "request the honor of your presence"

### Opening Section
- **Quote**: Meaningful love quote about marriage
- **Images**: Placeholder couple photo and decoration

### Event Details
- **Ceremony**: Default wedding ceremony details
- **Reception**: Default wedding reception details

### Couple Details
- **Groom**: Generic groom information with placeholder photo
- **Bride**: Generic bride information with placeholder photo

## Event Defaults

### Cover Section
- **Title**: "Special Event"
- **Subtitle**: "Join Us"
- **Header**: "You're Invited to"
- **Subheader**: "celebrate with us"

### Opening Section
- **Quote**: Inspirational quote about celebrations
- **Images**: Generic event placeholders

### Event Details
- **Main Event**: Generic event information

## Integration Points

### Frontend Components
- **New Invitation Page**: Users can select invitation type before choosing theme
- **Theme Components**: All themes support the default data structure
- **Form Renderer**: Automatically populates forms with default values

### Backend Integration
- **Strapi API**: Accepts and stores the complete default data structure
- **Type-Specific Details**: Uses dynamic zones to handle different invitation types

## Customization

### Adding New Invitation Types
1. Add new type to `INVITATION_TYPE_DEFAULTS`
2. Create default data structure in `getDefaultInvitationData()`
3. Update TypeScript types if needed
4. Create corresponding Strapi component if required

### Modifying Defaults
- Edit values in `invitation-defaults.ts`
- Update sample data files to match
- Ensure placeholder images are appropriate

## Benefits

### For Users
- **Quick Start**: Meaningful content from the beginning
- **Easy Customization**: Replace generic content with personal details
- **Professional Look**: Well-structured default content

### For Developers
- **Consistent Data**: Standardized default values across all invitation types
- **Easy Maintenance**: Centralized default data management
- **Extensible**: Easy to add new invitation types or modify existing ones

## Future Enhancements

### Planned Features
- **Multiple Templates**: Different default templates for each invitation type
- **Localization**: Default content in multiple languages
- **Smart Defaults**: AI-generated personalized defaults based on user preferences
- **Industry-Specific**: Specialized defaults for different industries or occasions

### Potential Improvements
- **Dynamic Dates**: Automatically set reasonable future dates
- **Location-Based**: Default venues based on user location
- **Theme-Specific**: Different defaults based on selected theme
- **User Preferences**: Remember user's preferred default values
