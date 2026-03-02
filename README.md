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

![hover-demo](images/hover-demo.png)

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

## 🚀 Installation

From VS Code Marketplace:
```
ext install json-comments-companion
```

## 🛠️ Development

```bash
# Clone & install
npm install

# Compile TypeScript
npm run compile

# Open in VS Code, press F5 to run
```

## 📦 Tech Stack

- 📝 TypeScript
- 🔌 VS Code Extension API
- 🎯 HoverProvider & CodeLensProvider

## ⚖️ License

MIT
