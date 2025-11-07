# PWA Update System

## Overview

The MTG Commander Deck Builder uses a Progressive Web App (PWA) architecture with service workers for offline functionality and automatic updates.

## How Updates Work

### Automatic Version Bumping

Every time you build the application, the version number is automatically incremented:

```bash
npm run build
```

This runs:
1. `bump-version.js` - Increments the service worker version
2. `generate-manifest.js` - Updates the manifest
3. `next build` - Builds the application

### Service Worker Update Flow

1. **New Version Detection**
   - Service worker checks for updates every 30 minutes
   - UpdateChecker component polls every 2 minutes
   - Updates are checked on page load

2. **User Notification**
   - When a new version is detected, a banner appears at the top
   - User can choose to "Update Now" or "Later"

3. **Update Process**
   - Clicking "Update Now" activates the new service worker
   - Page automatically reloads with the new version

## For Developers

### Manual Version Bump

To manually increment the version without building:

```bash
npm run bump-version
```

### Version Number Format

Versions follow the pattern: `MAJOR.MINOR`
- MAJOR: Incremented manually for breaking changes
- MINOR: Auto-incremented on each build

### Service Worker Caching

The service worker caches:
- Index page
- Manifest
- App icons
- Dynamically fetched assets (with network-first strategy)

### Debugging Updates

Enable console logging in the browser to see:
- Service worker registration
- Update checks
- Version changes
- Cache operations

Example console output:
```
SW registered: ServiceWorkerRegistration
SW periodic update check triggered.
Update found! New service worker installing.
New SW state: installed
New service worker installed, showing update prompt
```

## For Users

### Checking for Updates

Updates are automatic, but you can force a check by:
1. Refreshing the page
2. Closing and reopening the PWA
3. Waiting up to 30 minutes

### Troubleshooting

If updates aren't appearing:

1. **Clear Service Worker Cache**
   - Open DevTools (F12)
   - Go to Application → Service Workers
   - Click "Unregister"
   - Reload the page

2. **Hard Refresh**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Clear Browser Cache**
   - Settings → Privacy → Clear browsing data
   - Select "Cached images and files"

## Testing Updates Locally

1. Build with current version:
   ```bash
   npm run build
   npm run serve
   ```

2. Make changes to the code

3. Build again (version auto-increments):
   ```bash
   npm run build
   npm run serve
   ```

4. Open the app in a browser
5. Wait 2-30 minutes or refresh
6. Update banner should appear

## Production Deployment

When deploying to GitHub Pages or other hosting:

1. Version is auto-bumped during CI/CD build
2. New service worker is deployed
3. Users see update notification within 30 minutes
4. Clicking "Update Now" loads the new version

## Best Practices

- Always use `npm run build` for production builds
- Don't manually edit version numbers in `sw.js`
- Test updates in a separate browser profile
- Monitor console for service worker errors
- Keep update check intervals reasonable (don't spam)
