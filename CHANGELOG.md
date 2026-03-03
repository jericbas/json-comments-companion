# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Robust nested path resolution for objects and arrays
- Support for array indices in comment paths (e.g., `servers.0.port`)
- Smart path fallback - falls back to parent paths if exact match not found
- Improved error handling with user-friendly toast messages
- JSDoc documentation for all exported functions

### Fixed
- Fixed `parseJsonPath` bug that ignored parent paths
- Removed unused `getGitignorContent` function with typo in name
- Fixed extension only showing comments for top-level keys

### Changed
- `provideHover` now uses proper JSON structure analysis instead of regex
- `provideCodeLenses` tracks document hierarchy for full paths

## [0.2.0] - 2025-03-03

### Added
- Initial implementation of hover provider
- Initial implementation of CodeLens provider
- `openCommentsFile` command with auto-creation
- `toggleHover` and `toggleCodeLens` commands
- Configuration options: `hoverEnabled`, `codeLensEnabled`, `maxCommentLength`
- Basic nested path support (simple dot notation)

## [0.1.0] - 2025-03-01

### Added
- Project bootstrap
- TypeScript extension scaffolding
- Initial documentation
