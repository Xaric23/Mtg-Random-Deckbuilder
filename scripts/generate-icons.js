// Script to generate PWA icons from SVG
// Run with: node scripts/generate-icons.js
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const publicDir = path.join(__dirname, '..', 'public');

  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found!');
    return;
  }

  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}.png`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated icon-${size}.png`);
  }

  // Generate screenshots (simple colored rectangles for now)
  const screenshotWide = sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
    .png()
    .toFile(path.join(publicDir, 'screenshot-wide.png'));
  
  const screenshotNarrow = sharp({
    create: {
      width: 540,
      height: 720,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  })
    .png()
    .toFile(path.join(publicDir, 'screenshot-narrow.png'));

  console.log('Generated screenshots');
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);

