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
    console.error('manifest.json not found in public/');
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

  if (missing.length) {
    console.error('Manifest references missing files in public/:');
    missing.forEach(m => console.error('  -', m));
    process.exit(3);
  }

  console.log('Manifest validation passed. All referenced assets exist in public/.');
}

main();
