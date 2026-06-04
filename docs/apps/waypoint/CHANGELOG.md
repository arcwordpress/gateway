# Changelog

All notable changes to Waypoint will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-05-14

### Changed 

- Update migrations to use new format.
- Update package to use new register process.
- Update menu position.

## [1.1.10] - 2025-03-13

### Changed 

- Rebrand to neutral colors. 
- Style fix margin top to clear sticky header.
- Fix TOC output when empty. 

## [1.1.8] - 2025-12-16

### Changed 

Update route permissions. 

## [1.1.6] - 2025-11-18

### Changed
- Updated collection permissions to use hybrid authentication (supports both cookie auth and Basic Auth)
- All write operations (create/update/delete) now support Application Password authentication for remote API access
- Maintains backward compatibility with WordPress admin cookie authentication

### Improved
- Remote API integration support for content synchronization workflows
- Better authentication flexibility for headless and API-driven applications

## [1.1.5] - 2025-11-17

### Fixed
- Update to collection registries to work with changes to Gateway Forms.

## [1.1.3] - 2025-10-31

### Fixed
- Fixed sticky table of contents positioning in documentation pages
- Removed overflow-x-hidden that was interfering with sticky behavior
- Added proper flex container alignment for sticky elements

### Changed
- Converted code block styling from Tailwind to BEM methodology
- Disabled Tailwind preflight to prevent CSS reset conflicts
- Code blocks now maintain dark background in both light and dark modes
- Added subtle border to code blocks in dark mode only

### Improved
- Reduced CSS bundle size by ~40% by disabling preflight
- Better syntax highlighting display with consistent dark backgrounds

## [1.1.0] - 2025-10-20

### Changed
- Fixes stickiness of the left/right columns in UI. 
- Fixes markdown parsing in TOC, summaries.
- Adds mobile menu for TOC and main menu.

## [1.1.0] - 2025-10-20

### Changed
- Rebuilt for Gateway plugin with singular collections
- Migrated to Gateway Collection system for DocSet, DocGroup, and Doc models
- Updated Collections to use Gateway's collection architecture
- Streamlined codebase by removing legacy components

### Removed
- Legacy admin pages (DocSetPage, DocGroupPage, DocPage, Pages, AdminPage)
- Legacy models (DocSet, DocGroup, Doc)
- Legacy schemas (DocSetSchema, DocGroupSchema, DocSchema)

### Improved
- Performance through simplified architecture
- Code maintainability with unified collection system
- Frontend build updated with latest dependencies

### Requirements
- Now requires Gateway plugin to be installed and active

## [1.0.1] - 2024-XX-XX

### Improved
- Documentation layout and styling
- Sidebar navigation experience
- Table of contents positioning

### Fixed
- API routing issues
- Frontend display bugs

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- Multi-set documentation support
- Documentation groups and hierarchical organization
- Custom admin interface for managing docs
- Frontend template system with /docs endpoint
- Database-driven content management
- React-based frontend with markdown rendering
- Syntax highlighting for code blocks
- Responsive documentation viewer
