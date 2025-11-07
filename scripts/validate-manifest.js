 
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const manifestPath = path.join(publicDir, 'manifest.json');

function existsInPublic(src) {
  if (!src) return false;
  // skip external URLs
  if (/^https?:\/\//i.test(src)) return true;
  // strip leading slashes
  const relative = src.replace(/^\/+/, '');
  const full = path.join(publicDir, relative);
  return fs.existsSync(full);
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error('\x1b[31mError: manifest.json not found in public/\x1b[0m');
    console.error('Run `npm run generate-manifest` to create a new manifest.');
    process.exit(2);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const missing = [];

  if (Array.isArray(manifest.icons)) {
    manifest.icons.forEach((ico) => {
      if (!existsInPublic(ico.src)) missing.push(ico.src);
    });
  }

  if (Array.isArray(manifest.screenshots)) {
    manifest.screenshots.forEach((ss) => {
      if (!existsInPublic(ss.src)) missing.push(ss.src);
    });
  }

  if (!existsInPublic(manifest.start_url)) {
    // start_url is often './' so skip that case
    if (manifest.start_url && manifest.start_url !== './') missing.push(manifest.start_url);
  }

  // Check manifest properties
  const errors = [];
  
  // Check for required fields
  ['name', 'short_name', 'start_url', 'display'].forEach(field => {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check icons array
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    errors.push('Manifest must contain at least one icon');
  } else {
    manifest.icons.forEach((icon, index) => {
      if (!icon.src) errors.push(`Icon at index ${index} missing src`);
      if (!icon.sizes) errors.push(`Icon at index ${index} missing sizes`);
      if (!icon.type) errors.push(`Icon at index ${index} missing type`);
    });
  }

  // Report missing files
  if (missing.length) {
    errors.push('Missing files referenced in manifest:');
    missing.forEach(m => errors.push(`  - ${m}`));
  }

  // Report all errors or success
  if (errors.length) {
    console.error('Manifest validation failed:');
    errors.forEach(err => console.error(' ❌', err));
    process.exit(3);
  }

  console.log('✅ Manifest validation passed. All referenced assets exist and required fields are present.');
}

main();
