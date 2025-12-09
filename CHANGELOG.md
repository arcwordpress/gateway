# Changelog

All notable changes to the Gateway plugin will be documented in this file.

## [1.1.8] - 2025-12-08

### Added 
- Gateway Project collection for creating and tracking Gateway powered extensions in a low/no code process.

## [1.1.7] - 2025-11-21

### Added
- Nicer styling for admin heading and stats.

### Fixed 
- The authorization of remote access to API access with Basic Authentication.

## [1.1.6] - 2025-11-18

### Added
- Hybrid authentication to support remote API access. 

### Fixed 
- Authentication check for Basic Auth. 

## [1.1.5] - 2025-11-17

### Added
- Maze agent chat.
- Anthropic agent SDK for PHP.

### Fixed
- Studio app usage of form fields with 2 part names.

## [1.1.3] - 2025-11-04

### Added
- Fixes param usage issues in Get Many standard routes.
- Improves field type registration.
- Adds support for headless fields.

## [1.1.2] - 2025-10-28

### Added
- Filter and grid editor blocks
- Grid package updates
- Filter app functionality

### Changed
- Updated grid to app architecture

### Fixed
- Front-end form rendering issues
- Missing delete button
- File field validation

## [1.1.1] - 2025-10-21

### Changed
- Updated RELEASE.md documentation with specific file paths for version management
- Improved release process documentation

## [1.1.0] - 2025-10-20

### Added
- Grid support as a package for displaying tabular data with TanStack Table
- Filter handling functionality for data processing
- Public route permissions for API endpoints
- Collection-specific output routes
- Studio app with collection looping support
- NPM workflow for packaging

### Fixed
- Schema generation and form values submission
- Form output rendering

### Changed
- Updated admin app to render grid test components
- Enhanced studio app with improved collection handling

## [1.0.0] - 2025-10-20

### Added
- Initial release
- Core Gateway plugin functionality
- Collection registry system
- Eloquent ORM integration
- Admin interface
- React-based admin and studio apps
- Form handling system
