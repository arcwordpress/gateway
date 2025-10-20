# Gateway Plugin - Route Authentication Guide

This document explains the different authentication types available for routes in the Gateway plugin.

## Overview

Routes can be configured with different authentication levels to control access. The system supports:

1. **Public** - No authentication required, including external access
2. **Nonce Only** - WordPress nonce verification only, no user login required
3. **Cookie Authentication** - Full WordPress authentication (nonce + logged in user)
4. **Basic Auth** - HTTP Basic Authentication for external tools (Postman, etc.)

## Authentication Types

### 1. Public Access (`false`)

**Use case:** Completely public API endpoints accessible from anywhere

**Configuration:**
```php
protected $routes = [
    'permissions' => [
        'get_many' => false,  // Public read access
        'get_one' => false,   // Public single item access
    ]
];
```

**Characteristics:**
- No authentication required
- No nonce verification
- No user login required
- Accessible from external applications
- Use for truly public data

---

### 2. Nonce Only (`nonce_only`)

**Use case:** WordPress frontend requests that need CSRF protection but don't require user login

**Configuration:**
```php
protected $routes = [
    'permissions' => [
        'get_many' => [
            'type' => 'nonce_only',
            'settings' => []
        ]
    ]
];
```

**Characteristics:**
- Requires valid WordPress nonce
- No user login required
- Provides CSRF protection
- Useful for public WordPress pages that make API calls
- Still works with Basic Auth from Postman (nonce check is bypassed when Basic Auth succeeds)

**JavaScript Usage:**
```javascript
fetch('/wp-json/gateway/v1/tickets', {
    headers: {
        'X-WP-Nonce': wpApiSettings.nonce  // WordPress nonce
    }
})
```

---

### 3. Cookie Authentication (`cookie_authentication`)

**Use case:** Standard WordPress authenticated requests

**Configuration:**
```php
protected $routes = [
    'permissions' => [
        'create' => [
            'type' => 'cookie_authentication',
            'settings' => [
                'capability' => 'edit_posts'  // Optional capability requirement
            ]
        ]
    ]
];
```

**Characteristics:**
- Requires valid WordPress nonce
- Requires logged-in user
- Optional capability check
- Standard for WordPress admin/authenticated features
- Still works with Basic Auth from Postman (cookie auth is bypassed when Basic Auth succeeds)

**JavaScript Usage:**
```javascript
fetch('/wp-json/gateway/v1/tickets', {
    method: 'POST',
    headers: {
        'X-WP-Nonce': wpApiSettings.nonce,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
```

---

### 4. Basic Authentication (Automatic)

**Use case:** External tools like Postman, mobile apps, or third-party integrations

**Configuration:**
Enable Basic Auth in your collection (enabled by default):
```php
protected $routes = [
    'allow_basic_auth' => true,  // Default is true
    'permissions' => [
        // ... your permission config
    ]
];
```

**Characteristics:**
- Automatically checked BEFORE other authentication methods
- Uses WordPress Application Passwords
- Works with any permission type (public, nonce_only, cookie_authentication)
- If Basic Auth succeeds, capability checks still apply (but nonce/cookie checks are bypassed)
- If Basic Auth headers are present but invalid, request fails immediately

**Postman Usage:**
1. Go to WordPress admin → Users → Your Profile
2. Scroll to "Application Passwords"
3. Create a new application password
4. In Postman:
   - Auth Type: Basic Auth
   - Username: your WordPress username
   - Password: the application password (not your regular password)

**cURL Usage:**
```bash
curl -X GET https://example.com/wp-json/gateway/v1/tickets \
  -u username:application-password
```

---

## Permission Configuration Examples

### Example 1: Public Read, Authenticated Write
```php
protected $routes = [
    'permissions' => [
        'get_many' => false,              // Anyone can list
        'get_one' => false,               // Anyone can view
        'create' => 'edit_posts',         // Must have edit_posts capability
        'update' => 'edit_posts',         // Must have edit_posts capability
        'delete' => 'delete_posts',       // Must have delete_posts capability
    ]
];
```

### Example 2: Nonce-Protected Frontend API
```php
protected $routes = [
    'permissions' => [
        '*' => [
            'type' => 'nonce_only',
            'settings' => []
        ]
    ]
];
```

### Example 3: Admin-Only with Basic Auth Support
```php
protected $routes = [
    'allow_basic_auth' => true,
    'permissions' => [
        '*' => [
            'type' => 'cookie_authentication',
            'settings' => [
                'capability' => 'manage_options'
            ]
        ]
    ]
];
```

### Example 4: Mixed Access Levels
```php
protected $routes = [
    'allow_basic_auth' => true,
    'permissions' => [
        'get_many' => [
            'type' => 'nonce_only',
            'settings' => []
        ],
        'get_one' => false,  // Fully public
        'create' => [
            'type' => 'cookie_authentication',
            'settings' => [
                'capability' => 'edit_posts'
            ]
        ],
        'update' => 'edit_posts',  // Shorthand for cookie auth with capability
        'delete' => 'delete_posts'
    ]
];
```

---

## Authentication Flow

The system processes authentication in this order:

1. **Basic Auth Check** (if enabled and credentials provided)
   - If Basic Auth headers present → validate credentials
   - If valid → set current user, continue to capability checks
   - If invalid → return 401 error immediately

2. **Permission Config Check**
   - Determine which permission applies (route-specific or wildcard)
   - If `false` → allow access (public)
   - If not set → require login by default

3. **Authentication Type Check**
   - Route to appropriate handler based on `type` field
   - `nonce_only` → verify nonce only
   - `cookie_authentication` → verify nonce + user login + capability

4. **Capability Check** (if specified)
   - Verify current user has required capability
   - Return 403 if missing capability

---

## Summary Table

| Auth Type | Nonce Required | User Login Required | Capability Check | External Access | Use Case |
|-----------|---------------|---------------------|------------------|-----------------|----------|
| `false` (public) | No | No | No | Yes | Public APIs |
| `nonce_only` | Yes | No | No | Via Basic Auth | Frontend forms |
| `cookie_authentication` | Yes | Yes | Optional | Via Basic Auth | Admin features |
| Basic Auth | No | Yes (via auth) | Optional | Yes | Postman/External |

---

## Getting WordPress Nonce in JavaScript

**In WordPress admin or theme:**
```php
wp_localize_script('your-script', 'wpApiSettings', [
    'nonce' => wp_create_nonce('wp_rest'),
    'root' => esc_url_raw(rest_url())
]);
```

**In JavaScript:**
```javascript
const nonce = wpApiSettings.nonce;
// or
const nonce = window.wpApiSettings?.nonce;
```

---

## Troubleshooting

### "Nonce is invalid or missing"
- Make sure you're sending `X-WP-Nonce` header
- Verify nonce is created with `wp_create_nonce('wp_rest')`
- Check that nonce hasn't expired (typically 12-24 hours)

### "Invalid username or application password"
- Using Basic Auth from Postman? Create an Application Password in WordPress admin
- Don't use your regular WordPress password for Basic Auth
- Application Passwords require WordPress 5.6+ and HTTPS

### "You must be logged in"
- This route requires `cookie_authentication`
- Either log in to WordPress first, or use Basic Auth

### Basic Auth not working
- Verify `allow_basic_auth` is `true` in your collection
- Some servers block Basic Auth headers - check your server configuration
- Ensure you're using Application Passwords, not regular passwords
