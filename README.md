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
├── 📄 package.comments.json ← Your annotations
├── 📄 tsconfig.json
└── 📄 tsconfig.comments.json ← More annotations
```

**Hover over any key to see its comment:**

**CodeLens shows comments inline:**

```json
💬 Compile TypeScript
"build": "tsc",
💬 Development mode with auto-reload
"dev": "nodemon"
```

## 📋 Usage

### 1. Create a companion file

For `package.json`, create `package.comments.json`:

```json
{
  "comments": {
    "name": "Unique extension identifier for the marketplace",
    "version": "Use semantic versioning (semver)",
    "scripts": "NPM scripts section",
    "scripts.build": "Compiles TypeScript to JavaScript",
    "scripts.watch": "Development mode with auto-reload",
    "contributes.commands": "Commands available in command palette"
  }
}
```

### 2. Hover & See

Move your cursor over any JSON key — the comment appears! Supports nested paths like `scripts.build`.

### 3. Nested paths

Use dot notation for nested properties:

```json
{
  "comments": {
    "scripts.build": "Production build",
    "scripts.watch": "Development mode auto-reload",
    "dependencies.lodash": "Utility library for data manipulation",
    "servers.0.port": "Primary server port",
    "servers.1.port": "Secondary server port"
  }
}
```

### 4. Commands

| Command | Description |
|---------|-------------|
| `JSON: Open Comments File` | Opens or creates the companion file |
| `JSON: Toggle Hover Comments` | Enable/disable hover tooltips |
| `JSON: Toggle CodeLens Comments` | Enable/disable inline comments |
| `JSON: Clear Comments Cache` | Clear the comment cache (use if stale) |

Right-click any JSON file → "JSON: Open Comments File"

## ⚙️ Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `jsonCommentsCompanion.hoverEnabled` | boolean | `true` | Show comments on hover over JSON keys |
| `jsonCommentsCompanion.codeLensEnabled` | boolean | `true` | Show CodeLens annotations above JSON keys |
| `jsonCommentsCompanion.filePattern` | string | `/{filename}.comments.json` | Pattern for comment files (use `{filename}` as placeholder) |
| `jsonCommentsCompanion.maxCommentLength` | number | `50` | Maximum CodeLens text length (excess truncated with `...`) |

## 🚀 Installation

### From VS Code Marketplace

Search for "JSON Comments Companion" in the Extensions panel.

### From source

```bash
git clone https://github.com/jericbas/json-comments-companion.git
cd json-comments-companion
bun install
bun run compile
```

Press `F5` to open Extension Development Host.

> **Note:** You can also use `npm install` / `pnpm install` / `yarn install` if you prefer.

## 🛠️ Development

```bash
# Clone repo
git clone https://github.com/jericbas/json-comments-companion.git
cd json-comments-companion

# Install dependencies ( Bun recommended )
bun install

# Compile
bun run compile

# Watch mode
bun run watch

# Run tests
bun run test

# Package extension
bun run package
```

> **Note:** All `bun` commands work with `npm`, `pnpm`, or `yarn` as alternatives.

## 📸 Screenshots

*TODO: Screenshots showing hover tooltip and CodeLens on real config files*

## 📝 How it Works

1. **File Detection**: When you open `*.json`, the extension looks for `{filename}.comments.json`
2. **Path Resolution**: As you navigate JSON, it tracks your position in the document hierarchy
3. **Matching**: Builds full paths (e.g., `scripts.build`) and matches against comment keys
4. **Display**: Shows hover tooltips and inline CodeLens annotations

## 🚀 Auto-Refresh (No Reload Needed)

The extension watches your `.comments.json` files and automatically refreshes when they change. No need to reload VS Code window.

To manually clear the cache: Command Palette → `JSON: Clear Comments Cache`

## 🗺️ Roadmap

- [x] Basic hover and CodeLens
- [x] Nested path resolution (objects)
- [x] Array index support
- [x] File watcher for auto-refresh
- [ ] Quick Fix: "Add comment for this key"
- [ ] Markdown support in comments
- [ ] JSON Schema fallback

## 📦 How It Works - Technical

The extension uses VS Code's `HoverProvider` and `CodeLensProvider` APIs. The JSON document is parsed line-by-line to:

1. Track brace/bracket depth for nested objects and arrays
2. Build dot-notation paths from the current position
3. Match paths against the companion file's comment map

Caching via mtime ensures unchanged files aren't re-read. File watchers trigger auto-refresh when companion files update.

## ⚖️ License

MIT

---

**Like this extension?** Star it on [GitHub](https://github.com/jericbas/json-comments-companion)!
