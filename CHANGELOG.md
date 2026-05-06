# Changelog

All notable changes to the Gateway plugin will be documented in this file.

## [1.2.3-rc1] - 2026-05-06

### Fixed
- Migrations now re-run correctly on schema version bump so new columns
  (e.g. `package_key` on collections) are added to existing installs.
- `getPackages` endpoint no longer returns 500 when the `package_key` column
  is not yet present; falls back gracefully to the pivot relationship.
- Extension→collection edges in CollectionsViewer now render as orthogonal
  bus-style lines (trunk + branch) using the `busEdge` renderer instead of
  bezier curves.
- "All Records" page now lists Raptor DB-managed collections instead of only
  class-registered collections (which were empty for Raptor installs).

### Added
- `package_key` column on `gateway_raptor_collection` table — stores the
  package a collection belongs to, mirroring the `$package = 'events'`
  pattern on hand-written collection classes.
- Package select field on collection create/edit forms in CollectionsViewer.

## [1.2.2] - 2026-05-05

### Changed
- Prepare release 1.2.2.

## [1.2.1-rc5] - 2026-03-26

### Changed
- Remove \Gateway\Form namespace descriptor from Form List UI.
- Added security advisory of known issues.

## [1.2.1-rc1-rc4] - 2026-03-22

### Changed
- Change in terminology from "grids" to "views" and from "filters" to "facets". 
- Fix activation process and PDO connection issue.

### Added
- Draft of the Raptor graph editor based on React Flow and Dagre. 
- Visual builder for fields that combined list editing and graph diagram.

## [1.2.0-rc1] - 2026-02-18

### Changed
- Prepare release candidate for version 1.2.0

## [1.1.12-rc1] - 2026-01-29

### Changed
- Prepare release candidate for version 1.1.12

## [1.1.10-rc1] - 2026-01-17

### Changed
- Prepare release candidate for version 1.1.10

## [1.1.9] - 2025-12-16

### Added 
- Prototype no/low code extension builder interface.

### Fixed 
- Permissions handling with new authorization trait.

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
