# 🔖 JSON Comments Companion
> Add comments to your JSON files via companion files — no more "what does this field do?"

## ✨ The Problem

JSON doesn't support comments. But we need them.

```json
// ❌ This is invalid JSON!
{
  // Server port
  "port": 8080
}
```

## 🎯 The Solution

Pair any `.json` file with a `.{name}.comments.json` file:

```
📦 my-project/
 ├── 📄 package.json
 ├── 📄 package.comments.json  ← Your annotations
 ├── 📄 tsconfig.json
 └── 📄 tsconfig.comments.json  ← More annotations
```

**Hover over any key to see its comment:**

**CodeLens shows comments inline:**

```json
  // Extension ID for marketplace
  "name": "my-extension",
  
  // Follow semantic versioning
  "version": "1.0.0"
```

## 📋 Usage

### 1. Create a companion file

For `package.json`, create `package.comments.json`:

```json
{
  "comments": {
    "name": "Unique extension identifier for the marketplace",
    "version": "Use semantic versioning (semver)",
    "scripts.build": "Compiles TypeScript to JavaScript",
    "devDependencies.typescript": "TypeScript compiler version"
  }
}
```

### 2. Hover & See

Move your cursor over any JSON key — the comment appears!

### 3. Nested paths

Use dot notation for nested properties:

```json
{
  "comments": {
    "scripts.build": "Production build",
    "scripts.watch": "Development mode with auto-reload",
    "contributes.commands": "Commands available in command palette"
  }
}
```

## 🚧 Current Status

| Feature | Status |
|---------|--------|
| Hover tooltips | ✅ Working |
| CodeLens annotations | ✅ Working |
| Nested path support | 🚧 In progress |
| Settings/config | 📋 Planned |
| Marketplace publish | 📋 Planned |

## 🚀 Installation

> **Note:** Not yet published to marketplace. Install from source for now.

From source:
```bash
# Clone & install
git clone https://github.com/jericbas/json-comments-companion.git
cd json-comments-companion
npm install

# Compile TypeScript
npm run compile

# Open in VS Code, press F5 to run
```

## 🛠️ Development

```bash
# Clone repo
git clone https://github.com/jericbas/json-comments-companion.git
cd json-comments-companion

# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Run tests
npm test
```

## 📝 Known Issues

- Nested path parsing is basic — complex nested structures may not resolve correctly
- Error handling could be more graceful
- No settings/configuration options yet

## 🚀 RoadmapP

- [ ] Full nested path support (e.g., `scripts.build.watch`)
- [ ] Configuration options (toggle hover/CodeLens)
- [ ] Support for `.comments.md` files (Markdown comments)
- [ ] VS Code Marketplace publish
- [ ] Automated tests

## 📦 Tech Stack

- 📝 TypeScript
- 🔌 VS Code Extension API
- 🎯 HoverProvider & CodeLensProvider

## ⚖️ License

MIT
