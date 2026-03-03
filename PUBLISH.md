# 📦 Publishing to VS Code Marketplace

## Prerequisites

1. **Azure DevOps Organization**
   - Go to https://dev.azure.com/
   - Create free organization
   - Get Personal Access Token (PAT)

2. **VS Code Publisher Account**
   - Go to https://marketplace.visualstudio.com/
   - Sign in with Microsoft account
   - Link your Azure DevOps org
   - Create publisher: https://marketplace.visualstudio.com/manage

## Step 1: Install vsce

```bash
# Using npm
npm install -g @vscode/vsce

# Using bun
bun add -g @vscode/vsce
```

## Step 2: Get Personal Access Token (PAT)

1. Go to https://dev.azure.com/YOUR_ORG/_usersSettings/tokens
2. Create new token:
   - Name: `vscode-publish`
   - Organization: `All accessible organizations`
   - Scopes: `Marketplace` → `Manage`
3. Copy the token (save it securely!)

## Step 3: Login

```bash
vsce login YOUR_PUBLISHER_NAME
# Enter your PAT when prompted
```

## Step 4: Package & Publish

```bash
# Install dependencies and compile
bun install
bun run compile

# Package (creates .vsix)
vsce package

# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish 1.0.0
```

## 🔄 Updating

```bash
# Bump version
npm version patch  # or minor, major

# Publish
vsce publish
```

## 📋 Pre-publish Checklist

- [ ] Update `CHANGELOG.md`
- [ ] Update version in `package.json`
- [ ] Test the extension (`F5` → debug)
- [ ] Package works (`vsce package`)
- [ ] README is complete
- [ ] LICENSE file present
- [ ] Icon added (optional)

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Unauthorized" | Regenerate PAT, check scope |
| "Extension already exists" | Use `vsce publish --force` or bump version |
| "Missing README" | Ensure README.md is in root |

## 🚀 Quick Publish (One-liner)

```bash
cd ~/json-comments-companion && \
bun install && \
bun run compile && \
vsce package && \
vsce publish
```

Good luck! 🎉
