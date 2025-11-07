#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to service worker file
const swPath = path.join(__dirname, '..', 'public', 'sw.js');

// Read the service worker file
let swContent = fs.readFileSync(swPath, 'utf8');

// Extract current version
const versionMatch = swContent.match(/const CACHE_NAME = 'mtg-deckbuilder-v(\d+\.\d+)'/);
if (!versionMatch) {
  console.error('Could not find version in sw.js');
  process.exit(1);
}

const currentVersion = versionMatch[1];
const [major, minor] = currentVersion.split('.').map(Number);

// Increment minor version
const newMinor = minor + 1;
const newVersion = `${major}.${newMinor}`;

console.log(`Updating service worker version: ${currentVersion} → ${newVersion}`);

// Update all version references
swContent = swContent.replace(
  /const CACHE_NAME = 'mtg-deckbuilder-v[\d.]+'/,
  `const CACHE_NAME = 'mtg-deckbuilder-v${newVersion}'`
);
swContent = swContent.replace(
  /const CACHE_VERSION = '[\d.]+'/,
  `const CACHE_VERSION = '${newVersion}.0'`
);
swContent = swContent.replace(
  /const APP_VERSION = '[\d.]+'/,
  `const APP_VERSION = '${newVersion}.0'`
);

// Write updated content back
fs.writeFileSync(swPath, swContent, 'utf8');

console.log('✅ Service worker version updated successfully!');
console.log(`New version: ${newVersion}.0`);
