# 🚀 GitHub Releases + VSIX

## Why GitHub Releases?

- ✅ Users install `.vsix` before marketplace publish
- ✅ Easy rollback to older versions
- ✅ Shows in GitHub "Releases" tab
- ✅ Automated via GitHub Actions

## Quick Release

```bash
# 1. Tag a release
git tag v0.1.0
git push origin v0.1.0

# 2. GitHub Actions automatically:
#    - Compiles extension
#    - Creates .vsix package
#    - Uploads to GitHub Release
```

## Manual Release

```bash
# Compile and package
npm run compile
npm run package

# Create release on GitHub web UI
# Drag-drop the .vsix file
```

## Install from VSIX

```
VS Code → Extensions → ... → Install from VSIX → Select .vsix
```

## Setup GitHub Actions (Optional)

Create `.github/workflows/release.yml`:

```yaml
name: Release Extension
on:
  push:
    tags: ["v*"]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run compile
      - run: bun run package
      - uses: softprops/action-gh-release@v1
        with:
          files: "*.vsix"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
