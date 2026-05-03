# Gateway React — Build Guide

## Structure

```
react/
├── packages/          # Shared libraries (built first)
│   ├── data/          # @arcwp/gateway-data
│   ├── admin/         # @arcwp/gateway-admin
│   ├── forms/         # @arcwp/gateway-forms
│   └── grids/         # @arcwp/gateway-grids
└── apps/              # WordPress/Vite apps (built after packages)
    ├── admin/         # gateway-admin (wp-scripts)
    ├── form/          # gateway-form (wp-scripts)
    ├── grid/          # grid (wp-scripts)
    ├── studio/        # gateway-studio (wp-scripts)
    └── raptor/        # raptor (Vite + TypeScript)
```

## Setup

Run once from `react/` to install all workspace dependencies:

```bash
cd react
npm install
```

## Building

### Build everything (packages then apps)

```bash
# from react/
npm run build
```

### Build packages only

```bash
# from react/
npm run build:packages
```

### Build apps only

```bash
# from react/
npm run build:apps

# or directly from react/apps/
cd apps
npm run build
```

### Build a single package

```bash
# from react/
npm run build:data
npm run build:admin
npm run build:forms
npm run build:grids
```

### Build a single app

```bash
# from react/apps/
cd apps
npm run build:admin
npm run build:form
npm run build:grid
npm run build:studio
npm run build:raptor
```

## Notes

- **Build order matters.** Apps reference packages via `file:` links, so packages must be compiled before apps.
- The workspace root (`react/`) manages all `node_modules` via npm workspaces — do not run `npm install` inside individual package or app directories.
- `apps/raptor` uses Vite + TypeScript and runs `tsc -b && vite build`. The others use `@wordpress/scripts`.
