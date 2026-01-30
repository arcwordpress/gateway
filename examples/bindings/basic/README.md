# Gateway Block Bindings Test Plugin

A simple WordPress plugin that provides a visual admin interface for testing Gateway's automatic block binding data sources.

## Installation

1. Copy this folder (`basic`) to your WordPress `wp-content/plugins/` directory
2. Rename it to `gateway-bindings-test` (optional but recommended)
3. Activate the plugin in WordPress Admin > Plugins
4. Ensure the Gateway plugin is also active

## Usage

1. Go to **Tools > Bindings Test** in the WordPress admin
2. The page displays:
   - System status (WordPress version, Block Bindings API, Gateway status)
   - All registered binding sources with their available fields
   - Live data tests for Users and Posts
   - Custom binding tester with form input
   - Usage examples with code snippets

## Features

### System Status
Shows whether all requirements are met:
- WordPress 6.5+ (Block Bindings API requirement)
- Block Bindings API availability
- Gateway plugin activation

### Registered Binding Sources
Displays all automatically created binding sources from Gateway collections:
- Source name (e.g., `gateway/wp_user`)
- Label (e.g., "Gateway: User")
- Available fields
- Collection class name

### Live Data Tests

#### Users Tab
- Fetches first 5 users via `gateway/wp_user`
- Shows data in table format
- Simulates binding output

#### Posts Tab
- Fetches first 5 published posts via `gateway/wp_post`
- Shows data in table format
- Simulates binding output

#### Custom Test Tab
- Select any registered binding source
- Enter field name and record ID
- Execute test and see results
- Copy the generated block markup

### Usage Examples
Ready-to-use code snippets for:
- Basic paragraph binding
- Post title in heading
- Query Loop context-based binding
- Image with multiple attribute bindings

## Requirements

- WordPress 6.5 or later
- Gateway plugin (active)
- PHP 7.4 or later

## Screenshot

The admin page provides a visual dashboard with:
- Purple gradient header
- Card-based layout for binding sources
- Tabbed interface for data tests
- Syntax-highlighted code examples

## Files

```
basic/
├── basic-bindings-test.php   # Main plugin file
└── README.md                  # This file
```

## License

GPL v2 or later
