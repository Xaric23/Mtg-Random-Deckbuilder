# GitHub Pages Deployment Guide

## Quick Start

1. **Create a GitHub repository** (if you haven't already):
   - Go to https://github.com/new
   - Name it (e.g., `mtg-deckbuilder`)
   - Make it **Public** (required for free GitHub Pages)
   - Don't initialize with README
   - Click "Create repository"

2. **Initialize Git in your project**:
   ```bash
   cd C:\Users\Jason Rozansky\deckbuilder
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to `main`

5. **Your site will be live at**:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

## Automatic Deployment

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- Automatically build your Next.js app on every push
- Deploy the static files to GitHub Pages
- Update your site automatically when you push changes

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build the static files:
   ```bash
   npm run build
   ```

2. Switch to the `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   ```

3. Copy the `out` folder contents to the root:
   ```bash
   # On Windows PowerShell
   Copy-Item -Recurse -Force out/* .
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

5. In GitHub Settings → Pages, set source to `gh-pages` branch

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Update description"
git push
```

The GitHub Actions workflow will automatically rebuild and deploy your site!

