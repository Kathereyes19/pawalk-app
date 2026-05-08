# Pawalk Branding Guide

This document outlines how Pawalk brand assets are integrated throughout the application.

## Logo Assets

Three logo variations are available in `/src/imports/`:

1. **Full_logo_version.png** - Complete logo with dog icon + PAWALK text
2. **Icon-only_version.png** - Dog icon only (no text)
3. **_P__logo.png** - Letter P with paw print detail

## Logo Usage Map

### Full Logo (Icon + Text)
**File:** `Full_logo_version.png`  
**Use for:** Primary brand presentation moments, large format displays

**Screens:**
- ✅ **SplashScreen** - Main brand introduction (280px wide)
  - Location: Center of screen
  - Animation: Float + glow effect
  - Context: App loading/initialization

### Icon-Only Version
**File:** `Icon-only_version.png`  
**Use for:** Navigation bars, compact UI spaces, onboarding headers

**Screens:**
- ✅ **WelcomeScreen** - Header logo (80px)
  - Location: Top center with "Pawalk" text below
  - Animation: Scale + bounce on enter

- ✅ **LoginScreen** - Authentication header (64px)
  - Location: Above "Bienvenido de vuelta" heading
  - Style: Centered, minimal

- ✅ **SignUpScreen** - Registration header (64px)
  - Location: Above "Crea tu cuenta" heading
  - Style: Centered, minimal

- ✅ **PersonalProfileSetupScreen** - Onboarding header (80px)
  - Location: Top center of profile setup
  - Animation: Scale + rotate on enter
  - Context: First step of new user onboarding

- ✅ **OnboardingPetSetupScreen** - Onboarding header (80px)
  - Location: Top center of pet setup
  - Animation: Scale + rotate on enter
  - Context: Second step of new user onboarding

### P Logo Version
**File:** `_P__logo.png`  
**Reserved for:** Profile placeholders, notification icons, small branding contexts

**Current Status:** Available for future implementation
- Potential uses: User profile avatars, notification badges, favicon, app shortcuts

## Implementation Guidelines

### Sizing Standards
- **Splash/Hero:** 280px width (full logo)
- **Headers:** 64-80px (icon-only)
- **Navigation:** 40-48px (icon-only or P logo)
- **Notifications:** 24-32px (P logo)

### Import Pattern
```tsx
import fullLogo from '../../imports/Full_logo_version.png';
import iconOnlyLogo from '../../imports/Icon-only_version.png';
import pLogo from '../../imports/_P__logo.png';
```

### Usage Pattern
```tsx
<img
  src={iconOnlyLogo}
  alt="Pawalk"
  className="w-16 h-16 object-contain"
/>
```

### Responsive Behavior
- Logos maintain aspect ratio using `object-contain`
- No stretching or distortion
- Proper padding and spacing around logos
- Shadow effects for depth on light backgrounds

### Dark Mode Considerations
- All logo variations work on both light and dark backgrounds
- Logo colors remain consistent (orange/yellow brand palette)
- No separate dark mode variants needed
- Ensure adequate contrast on all background colors

## Brand Consistency Checklist

When adding new screens or components:

- [ ] Choose appropriate logo variation based on context
- [ ] Use correct sizing for the context
- [ ] Maintain proper spacing around logo
- [ ] Test on both light and dark themes
- [ ] Ensure logo doesn't interfere with content
- [ ] Add proper alt text for accessibility
- [ ] Consider animation appropriately for the context

## Future Enhancements

Potential areas for expanded logo usage:

1. **Loading States** - Use icon-only logo with animation
2. **Error Pages** - Use icon-only logo with friendly messaging
3. **Email Templates** - Use full logo in header
4. **Push Notifications** - Use P logo as notification icon
5. **Map Markers** - Consider icon-only for user location
6. **Profile Placeholders** - Use P logo for default avatars

## Notes

- All logos are PNG format with transparent backgrounds
- Logos use the Pawalk brand colors (orange #FF6B35, yellow #F7C548)
- Logo files are optimized for web use
- No SVG versions available (using PNG assets as provided)
- Logo files are located in `/src/imports/` directory
