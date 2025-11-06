const { describe, it, expect, afterEach } = require('vitest');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const manifestPath = path.join(publicDir, 'manifest.json');
const templatePath = path.join(publicDir, 'manifest.template.json');

describe('manifest management', () => {
  // Clean up after each test
  afterEach(() => {
    if (fs.existsSync(manifestPath)) {
      fs.unlinkSync(manifestPath);
    }
  });

  it('should generate valid manifest from template', () => {
    // Run manifest generation
    execSync('npm run generate-manifest', { stdio: 'pipe' });

    // Verify manifest was created
    expect(fs.existsSync(manifestPath)).toBe(true);

    // Read and parse the manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Verify required fields
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('icons');
    expect(Array.isArray(manifest.icons)).toBe(true);
  });

  it('should validate manifest successfully', () => {
    // Run manifest generation first
    execSync('npm run generate-manifest', { stdio: 'pipe' });

    // Run validation
    const output = execSync('npm run validate-manifest', { stdio: 'pipe' }).toString();
    expect(output).toContain('Manifest validation passed');
  });
});