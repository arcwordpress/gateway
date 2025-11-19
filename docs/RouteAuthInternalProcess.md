# Gateway Route Authentication Internal Process

## Current Authentication Flow

### Overview
Gateway routes handle authentication through a layered approach in `BaseEndpoint.php`. The `checkPermissions()` method is called for every REST API request and determines whether to allow access.

### Authentication Flow (Line 46-130 of BaseEndpoint.php)

```
1. Basic Auth Check (if enabled)
   ├─> If Basic Auth headers present
   │   ├─> Validate credentials via wp_authenticate_application_password()
   │   ├─> If valid: Set current user & check capability requirements
   │   └─> If invalid: Return 401 error immediately
   └─> If no Basic Auth headers: Continue to permission config

2. Permission Config Lookup
   ├─> Check route-specific permission (e.g., permissions['create'])
   ├─> Fallback to wildcard permission (permissions['*'])
   └─> If no config: Default to requiring login

3. Permission Type Routing
   ├─> cookie_authentication: Require nonce + capability check
   ├─> nonce_only: Require nonce only (no login)
   ├─> jwt: Future implementation (currently 501 error)
   └─> Unknown type: Return 500 error
```

### Current Issues

#### 1. **Basic Auth Doesn't Bypass Permission Type**
**Problem:** Even when Basic Auth succeeds (line 56-59), it still checks capability requirements but does NOT bypass the permission type check. If the permission type is set to `'cookie_authentication'`, the flow continues to line 114 which requires a cookie nonce, causing remote API calls to fail with 401/403 errors.

**Code Location:** Lines 54-66
```php
if ($allowBasicAuth) {
    $basicAuthResult = $this->checkBasicAuthentication($request);
    if ($basicAuthResult === true) {
        // Basic auth succeeded, now check capability requirements
        return $this->checkCapabilityRequirements($permissions, $routeType);
    }
    // ...
}
```

**Issue:** After Basic Auth succeeds, it returns the capability check result, which bypasses the permission type routing (lines 113-129). However, if Basic Auth is NOT attempted (no headers), it falls through to the permission type switch statement which may require cookie_authentication with nonce.

#### 2. **Confusing Override System**
**Problem:** The permission configuration has too many layers:
- Collection-level: `$routes['allow_basic_auth']` (global flag)
- Route-level: `$routes['permissions']['create']['type']` (auth type per route)
- Route-level: `$routes['permissions']['create']['settings']['capability']` (capability requirement)

**Example from DocSetCollection:**
```php
'allow_basic_auth' => true,  // Global: Basic Auth is allowed
'permissions' => [
    'create' => [
        'type' => 'cookie_authentication',  // Route-specific: REQUIRES cookie auth
        'settings' => [
            'capability' => 'edit_posts'    // Also requires this capability
        ]
    ]
]
```

This creates confusion: Is Basic Auth allowed or not? The answer: Basic Auth is checked first, but only if headers are present. If no Basic Auth headers exist, it falls back to requiring cookie_authentication.

#### 3. **Missing "Hybrid" Auth Type**
**Problem:** No permission type exists for "accept either cookie OR basic auth". Current types:
- `cookie_authentication`: Requires nonce + cookies (fails for remote API)
- `nonce_only`: Allows frontend without login (too permissive for writes)
- `jwt`: Not implemented

**Need:** A type like `'authentication_required'` that accepts:
- Cookie auth with nonce (for WP admin context)
- Basic Auth with Application Password (for remote/API context)
- Eventually JWT tokens (for OAuth apps)

### How Each Auth Type Works

#### Cookie Authentication (`type: 'cookie_authentication'`)
**Location:** Lines 232-283
**Requirements:**
1. Valid WordPress nonce (X-WP-Nonce header or _wpnonce param)
2. User is logged in (WordPress session cookie)
3. User has required capability

**Use Case:** WordPress admin panel, authenticated frontend

**Fails For:** Remote API calls (no WP session cookies)

#### Nonce Only (`type: 'nonce_only'`)
**Location:** Lines 285-311
**Requirements:**
1. Valid WordPress nonce only
2. NO login required

**Use Case:** Public frontend access with CSRF protection

**Fails For:** Requires capability checks (anyone with a nonce can access)

#### Basic Authentication
**Location:** Lines 137-194
**Requirements:**
1. Authorization header: `Basic base64(username:password)`
2. Valid Application Password via `wp_authenticate_application_password()`
3. User has required capability (checked separately in checkCapabilityRequirements)

**Use Case:** Remote API access, CLI tools, external applications

**Currently Works:** Only if permission type is NOT `'cookie_authentication'`

### Route Type System

Each standard route has a type (defined by `getType()` in route classes):
- `'get_many'` - GetManyRoute.php
- `'get_one'` - GetOneRoute.php
- `'create'` - CreateRoute.php
- `'update'` - UpdateRoute.php
- `'delete'` - DeleteRoute.php

These types are used to look up route-specific permissions in the collection config.

## Recommendations

### 1. Add Hybrid Authentication Type

**Add new auth type:** `'hybrid_authentication'` or `'authentication_required'`

```php
case 'hybrid_authentication':
    // Accept either cookie auth OR basic auth
    // Basic auth already checked and succeeded, just verify capability
    if (is_user_logged_in()) {
        // Already authenticated via Basic Auth or Cookie
        $capability = $settings['capability'] ?? null;
        if ($capability && !current_user_can($capability)) {
            return new WP_Error('rest_forbidden',
                sprintf('You need the "%s" capability.', $capability),
                ['status' => 403]
            );
        }
        return true;
    }

    // Not authenticated
    return new WP_Error('rest_forbidden',
        'Authentication required. Use Application Password or login.',
        ['status' => 401]
    );
```

**Benefits:**
- Works for WP admin (cookie + nonce)
- Works for remote API (Basic Auth)
- Works for future JWT implementation
- Single configuration for all contexts

### 2. Simplify Permission Config Structure

**Current (Verbose):**
```php
'permissions' => [
    'get_many' => [
        'type' => 'nonce_only',
        'settings' => []
    ],
    'create' => [
        'type' => 'cookie_authentication',
        'settings' => [
            'capability' => 'edit_posts'
        ]
    ],
]
```

**Proposed (Simpler):**
```php
'permissions' => [
    'get_many' => 'public',  // or false for no auth
    'get_one' => 'public',
    'create' => 'edit_posts',  // String = capability required, hybrid auth
    'update' => 'edit_posts',
    'delete' => 'delete_posts',

    // OR for explicit control:
    '*' => 'hybrid:edit_posts'  // Default for all routes
]
```

**String Format Options:**
- `false` or `'public'` - No authentication required
- `'nonce_only'` - Nonce check only (frontend access)
- `'capability_name'` - Hybrid auth + capability check
- `'hybrid:capability'` - Explicit hybrid auth
- `'cookie:capability'` - Force cookie auth only
- `'basic:capability'` - Force basic auth only

**Backwards Compatibility:** Keep array format support, but convert strings internally:

```php
if (is_string($permissionConfig)) {
    // Parse string format
    if ($permissionConfig === false || $permissionConfig === 'public') {
        return true;
    }

    if ($permissionConfig === 'nonce_only') {
        return $this->checkNonceOnly([]);
    }

    // Check for prefix (e.g., 'hybrid:edit_posts')
    if (strpos($permissionConfig, ':') !== false) {
        list($authType, $capability) = explode(':', $permissionConfig, 2);
        $permissionConfig = [
            'type' => $authType . '_authentication',
            'settings' => ['capability' => $capability]
        ];
    } else {
        // Plain capability string = hybrid auth
        $permissionConfig = [
            'type' => 'hybrid_authentication',
            'settings' => ['capability' => $permissionConfig]
        ];
    }
}
```

### 3. Fix Basic Auth Bypass Logic

**Current Issue:** Lines 54-66 handle Basic Auth, but the logic doesn't properly bypass permission type checks.

**Fix:** If Basic Auth succeeds, return immediately with capability check. Don't fall through to permission type routing.

```php
// Check for Basic Authentication first (if enabled)
if ($allowBasicAuth) {
    $basicAuthResult = $this->checkBasicAuthentication($request);
    if ($basicAuthResult === true) {
        // Basic auth succeeded, check capabilities and return
        return $this->checkCapabilityRequirements($permissions, $routeType);
    }
    // If basic auth returned WP_Error AND headers were present, fail immediately
    if (is_wp_error($basicAuthResult) && $this->hasBasicAuthHeaders($request)) {
        return $basicAuthResult;  // Return 401 error
    }
    // No basic auth attempted, fall through to permission config
}
```

This is actually correct! The issue is that `checkCapabilityRequirements()` needs to be called AFTER checking the permission type in most cases. The real fix is to make Basic Auth success truly bypass the permission type requirement.

### 4. Default Configuration Template

**Recommended default for most collections:**

```php
protected $routes = [
    'enabled' => true,
    'namespace' => 'gateway',
    'version' => 'v1',
    'route' => null,  // Auto-generated from collection key
    'allow_basic_auth' => true,  // Enable Application Password auth
    'methods' => [
        'get_many' => true,
        'get_one' => true,
        'create' => true,
        'update' => true,
        'delete' => true,
    ],
    'permissions' => [
        // Read operations: Public with nonce
        'get_many' => 'nonce_only',
        'get_one' => 'nonce_only',

        // Write operations: Hybrid auth + capabilities
        'create' => 'edit_posts',
        'update' => 'edit_posts',
        'delete' => 'delete_posts',
    ],
];
```

**This means:**
- GET requests: Work from frontend with nonce, OR with Basic Auth
- POST/PUT/DELETE: Work from admin with cookies, OR with Basic Auth + capability

### 5. Documentation Needs

**For developers, document these use cases:**

1. **Public Frontend Read Access:**
```php
'permissions' => [
    'get_many' => 'nonce_only',
    'get_one' => 'nonce_only',
]
```

2. **Admin-Only Access:**
```php
'permissions' => [
    '*' => 'manage_options',  // All routes require admin
]
```

3. **Hybrid Access (Admin + API):**
```php
'permissions' => [
    'create' => 'edit_posts',  // Works with cookies OR Basic Auth
    'update' => 'edit_posts',
]
```

4. **API-Only Access:**
```php
'allow_basic_auth' => true,
'permissions' => [
    '*' => [
        'type' => 'basic_authentication',  // Only Basic Auth accepted
        'settings' => ['capability' => 'edit_posts']
    ]
]
```

## Summary

**Immediate Fix for Current Issue:**
The DocSetCollection needs permission type changed from `'cookie_authentication'` to a type that supports Basic Auth. Quick fix:

```php
'create' => [
    'type' => 'cookie_authentication',  // REMOVE THIS
    'settings' => [
        'capability' => 'edit_posts'
    ]
],
```

Change to:

```php
'create' => 'edit_posts',  // Simple string = hybrid auth (once implemented)
```

Or temporarily remove the permission config entirely and let it fall through to capability-only check:

```php
'permissions' => [
    // Don't define create/update, let default login check handle it
    'get_many' => 'nonce_only',
    'get_one' => 'nonce_only',
]
```

**Long-term Solution:**
1. Implement `hybrid_authentication` type
2. Simplify permission config to string format
3. Update default collection template
4. Document all use cases clearly
