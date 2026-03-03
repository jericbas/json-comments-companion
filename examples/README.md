# 📚 Examples Directory

Sample `.comments.json` files demonstrating real-world documentation.

## 📦 package.comments.json

Documents a VS Code extension manifest. Shows how to explain:
- Extension metadata (name, version, description)
- VS Code engine compatibility
- Activation events and contributes
- npm scripts and dev dependencies

## ⚙️ tsconfig.comments.json

Documents TypeScript compiler options. Useful for:
- Team onboarding
- Compiler configuration reference
- Modern TS features (strict mode, ESM, etc)

## 🔧 settings.comments.json

Documents VS Code user settings. Good for:
- Sharing team configurations
- Personal .dotfiles repos
- Explaining editor preferences

## 💡 Usage Tips

1. **Copy and customize** — Start with these templates
2. **Use dot notation** → `"scripts.build"` not `"scripts": { "build": ... }`
3. **Keep comments short** — Under 60 chars for CodeLens readability
4. **Add emoji** — Visual scanning: ⚙️ = settings, 🔧 = tools, etc
5. **Comments support Markdown** — `**bold**`, `code`, [links](url)

## 🚀 Quick Start

```bash
# Use these as templates for your project
cp examples/package.comments.json my-project/package.comments.json
cp examples/tsconfig.comments.json my-project/tsconfig.comments.json
```
