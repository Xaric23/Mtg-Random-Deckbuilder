const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const templatePath = path.join(publicDir, 'manifest.template.json');
const outPath = path.join(publicDir, 'manifest.json');
const nextConfigPath = path.join(repoRoot, 'next.config.ts');

function getBasePathFromNextConfig() {
  try {
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    const m = content.match(/basePath\s*:\s*['"]([^'"]+)['"]/);
    if (m) return m[1];
  } catch (e) {
    // ignore
  }
  return '';
}

function main() {
  let template;
  if (fs.existsSync(templatePath)) {
    template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  } else if (fs.existsSync(outPath)) {
    template = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  } else {
    console.error('No manifest.template.json or manifest.json found in public/.');
    process.exit(1);
  }

  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || '';
  const basePathFromNext = getBasePathFromNextConfig();
  const basePath = envBasePath || basePathFromNext || '';

  // Normalize basePath (no trailing slash)
  const normalizedBase = basePath.replace(/\/$/, '');

  // Ensure start_url is relative
  template.start_url = './';

  // Normalize icons and screenshots to relative paths (no leading slash)
  if (Array.isArray(template.icons)) {
    template.icons = template.icons.map((ico) => {
      const src = (ico.src || '').toString();
      const filename = src.split('/').pop();
      // use relative path so it works on GitHub Pages
      return Object.assign({}, ico, { src: filename });
    });
  }

  if (Array.isArray(template.screenshots)) {
    template.screenshots = template.screenshots.map((ss) => {
      const src = (ss.src || '').toString();
      const filename = src.split('/').pop();
      return Object.assign({}, ss, { src: filename });
    });
  }

  // Write manifest.json
  fs.writeFileSync(outPath, JSON.stringify(template, null, 2));
  console.log('Generated manifest.json from template (basePath=', normalizedBase, ')');
}

main();
