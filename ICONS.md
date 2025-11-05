# Icon Generation

## Quick Setup

If you have `sharp` installed, run:
```bash
npm run generate-icons
```

## Manual Setup

You need to create the following icon files in the `public` folder:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels  
3. **screenshot-wide.png** - 1280x720 pixels (optional)
4. **screenshot-narrow.png** - 540x720 pixels (optional)

You can use the provided `icon.svg` as a base and convert it to PNG using:
- Online tools like https://cloudconvert.com/svg-to-png
- Image editing software (GIMP, Photoshop, etc.)
- The provided script (requires `sharp`)

## Temporary Solution

For development, you can use placeholder icons. The app will still work, but the install prompt may not appear until proper icons are added.

