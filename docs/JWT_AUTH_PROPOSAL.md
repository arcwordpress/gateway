# JWT Token Authentication Proposal

## Executive Summary

This proposal outlines a JWT token-based authentication system that solves the "same-site access" problem where anonymous users from your domain need access to non-public content without requiring WordPress authentication.

## Current State Analysis

### Existing Authentication Methods

Your system currently supports three authentication methods:

1. **Cookie Auth** (WordPress session + nonce)
   - ✅ Fully implemented
   - ❌ Requires user login
   - ❌ Doesn't work for anonymous same-site requests

2. **Basic Auth** (Application Passwords)
   - ✅ Fully implemented
   - ❌ Poor browser support
   - ❌ Credentials must be stored/managed
   - ❌ Can't distinguish anonymous same-site users

3. **JWT/Bearer Tokens**
   - ✅ Detection implemented (`RouteAuthenticationTrait.php:16-18`)
   - ❌ Validation returns 501 error (not implemented)
   - ✅ Infrastructure ready for implementation

### Permission Levels

```
┌─────────────────────────────────────────────────────────────┐
│  Permission Type  │  Auth Required  │  Capability Required  │
├───────────────────┼─────────────────┼───────────────────────┤
│  public           │       No        │         No            │
│  public_secured   │      Yes        │         No            │
│  protected        │      Yes        │        Yes            │
└─────────────────────────────────────────────────────────────┘
```

### The Problem

**Current limitation:** Anonymous users from your domain can only access `public` routes.

**Your goal:** Allow same-domain requests to access `public_secured` routes without WordPress login.

**Why existing methods fail:**
- Cookie Auth requires WordPress login (not anonymous)
- Basic Auth requires credentials (doesn't identify same-site origin)
- JWT is not implemented yet

## Proposed Solution: Multi-Level JWT Tokens

### Three Token Types

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. SAME_SITE Token                                               │
├──────────────────────────────────────────────────────────────────┤
│  Purpose:    Anonymous same-domain access                        │
│  How issued: GET /gateway/v1/auth/token (no auth required)      │
│  Validation: Checks HTTP Referer or Origin headers              │
│  Lifetime:   1 hour (short-lived, renewable)                    │
│  Access:     'public' and 'public_secured' routes               │
│  Claims:     {                                                   │
│                iss: "your-domain.com",                           │
│                aud: "your-domain.com",                           │
│                exp: timestamp + 3600,                            │
│                iat: timestamp,                                   │
│                type: "same_site",                                │
│                jti: unique_token_id                              │
│              }                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 2. USER Token                                                    │
├──────────────────────────────────────────────────────────────────┤
│  Purpose:    Authenticated WordPress user API access            │
│  How issued: POST /gateway/v1/auth/login (username + password)  │
│  Lifetime:   24 hours (renewable with refresh token)            │
│  Access:     All routes based on user capabilities              │
│  Claims:     {                                                   │
│                iss: "your-domain.com",                           │
│                aud: "your-domain.com",                           │
│                exp: timestamp + 86400,                           │
│                iat: timestamp,                                   │
│                type: "user",                                     │
│                user_id: 123,                                     │
│                user_login: "johndoe",                            │
│                capabilities: ["edit_posts", "read"],             │
│                jti: unique_token_id                              │
│              }                                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 3. API Token                                                     │
├──────────────────────────────────────────────────────────────────┤
│  Purpose:    Long-lived application/service access              │
│  How issued: Admin UI or wp-cli command                         │
│  Lifetime:   30+ days or no expiration                          │
│  Access:     Full API access (bypasses capability checks)       │
│  Claims:     {                                                   │
│                iss: "your-domain.com",                           │
│                aud: "your-domain.com",                           │
│                exp: null or timestamp + 2592000,                 │
│                iat: timestamp,                                   │
│                type: "api",                                      │
│                app_name: "mobile_app",                           │
│                scope: "full",                                    │
│                jti: unique_token_id                              │
│              }                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### How It Solves Your Problem

**Scenario: Anonymous user on your site wants to fetch data from a `public_secured` route**

1. **Frontend JavaScript** requests a token:
   ```javascript
   // On page load or before first API call
   const response = await fetch('/wp-json/gateway/v1/auth/token', {
     method: 'GET'
   });
   const { token } = await response.json();
   localStorage.setItem('gateway_token', token);
   ```

2. **Token endpoint** validates same-site origin:
   ```php
   // Checks HTTP_REFERER or HTTP_ORIGIN
   // Issues token only if request comes from your domain
   ```

3. **Frontend uses token** for API requests:
   ```javascript
   const token = localStorage.getItem('gateway_token');
   const data = await fetch('/wp-json/gateway/v1/posts', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

4. **API validates token**:
   - Verifies signature
   - Checks expiration
   - Reads `type: "same_site"` claim
   - Grants access to `public_secured` routes

**Result:** Anonymous same-domain users can access `public_secured` content without login!

## Implementation Details

### 1. JWT Library

Use Firebase JWT (already common in WordPress ecosystem):

```bash
composer require firebase/php-jwt
```

### 2. New Files to Create

```
lib/
├── REST/
│   ├── JWTService.php              # Core JWT operations
│   └── JWTAuthEndpoint.php         # Token issuance endpoints
└── Admin/
    └── APITokenManager.php         # UI for managing API tokens
```

### 3. Core JWT Service

**File: `lib/REST/JWTService.php`**

```php
<?php

namespace Gateway\REST;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

class JWTService
{
    /**
     * Get the secret key for JWT signing (stored in wp-config.php or auto-generated)
     */
    private static function getSecretKey()
    {
        if (defined('GATEWAY_JWT_SECRET')) {
            return GATEWAY_JWT_SECRET;
        }

        // Generate and store in database if not in config
        $secret = get_option('gateway_jwt_secret');
        if (!$secret) {
            $secret = bin2hex(random_bytes(32));
            update_option('gateway_jwt_secret', $secret, false);
        }

        return $secret;
    }

    /**
     * Get the issuer/audience (site domain)
     */
    private static function getDomain()
    {
        return parse_url(home_url(), PHP_URL_HOST);
    }

    /**
     * Issue a same-site token (for anonymous same-domain access)
     */
    public static function issueSameSiteToken()
    {
        // Validate request comes from same domain
        if (!self::validateSameSiteRequest()) {
            return new \WP_Error(
                'invalid_origin',
                'Same-site tokens can only be issued to requests from the same domain',
                ['status' => 403]
            );
        }

        $now = time();
        $payload = [
            'iss' => self::getDomain(),
            'aud' => self::getDomain(),
            'iat' => $now,
            'exp' => $now + 3600, // 1 hour
            'type' => 'same_site',
            'jti' => wp_generate_uuid4(),
        ];

        return JWT::encode($payload, self::getSecretKey(), 'HS256');
    }

    /**
     * Issue a user token (after authentication)
     */
    public static function issueUserToken($user_id)
    {
        $user = get_userdata($user_id);
        if (!$user) {
            return new \WP_Error('invalid_user', 'User not found');
        }

        $now = time();
        $payload = [
            'iss' => self::getDomain(),
            'aud' => self::getDomain(),
            'iat' => $now,
            'exp' => $now + 86400, // 24 hours
            'type' => 'user',
            'user_id' => $user_id,
            'user_login' => $user->user_login,
            'capabilities' => array_keys($user->allcaps),
            'jti' => wp_generate_uuid4(),
        ];

        return JWT::encode($payload, self::getSecretKey(), 'HS256');
    }

    /**
     * Issue a long-lived API token
     */
    public static function issueAPIToken($app_name, $expires_in = null)
    {
        $now = time();
        $payload = [
            'iss' => self::getDomain(),
            'aud' => self::getDomain(),
            'iat' => $now,
            'exp' => $expires_in ? $now + $expires_in : null,
            'type' => 'api',
            'app_name' => $app_name,
            'scope' => 'full',
            'jti' => wp_generate_uuid4(),
        ];

        // Store token metadata in database for revocation
        self::storeAPIToken($payload['jti'], $app_name, $payload['exp']);

        return JWT::encode($payload, self::getSecretKey(), 'HS256');
    }

    /**
     * Validate and decode a JWT token
     *
     * @param string $token
     * @return object|WP_Error Decoded token payload or error
     */
    public static function validateToken($token)
    {
        try {
            $decoded = JWT::decode($token, new Key(self::getSecretKey(), 'HS256'));

            // Validate issuer and audience
            if ($decoded->iss !== self::getDomain() || $decoded->aud !== self::getDomain()) {
                return new \WP_Error(
                    'jwt_invalid_issuer',
                    'Token issuer or audience mismatch',
                    ['status' => 403]
                );
            }

            // Check if token is revoked (for API tokens)
            if ($decoded->type === 'api' && self::isTokenRevoked($decoded->jti)) {
                return new \WP_Error(
                    'jwt_revoked',
                    'This token has been revoked',
                    ['status' => 401]
                );
            }

            return $decoded;

        } catch (ExpiredException $e) {
            return new \WP_Error(
                'jwt_expired',
                'Token has expired',
                ['status' => 401]
            );
        } catch (SignatureInvalidException $e) {
            return new \WP_Error(
                'jwt_invalid_signature',
                'Token signature is invalid',
                ['status' => 403]
            );
        } catch (\Exception $e) {
            return new \WP_Error(
                'jwt_invalid',
                'Token validation failed: ' . $e->getMessage(),
                ['status' => 401]
            );
        }
    }

    /**
     * Validate that request comes from same domain
     */
    private static function validateSameSiteRequest()
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $currentDomain = self::getDomain();

        // Check referer
        if ($referer) {
            $refererHost = parse_url($referer, PHP_URL_HOST);
            if ($refererHost === $currentDomain) {
                return true;
            }
        }

        // Check origin
        if ($origin) {
            $originHost = parse_url($origin, PHP_URL_HOST);
            if ($originHost === $currentDomain) {
                return true;
            }
        }

        // If neither header is present, check if request is from admin area
        if (is_admin() || is_user_logged_in()) {
            return true;
        }

        return false;
    }

    /**
     * Store API token metadata for revocation support
     */
    private static function storeAPIToken($jti, $app_name, $expires)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gateway_api_tokens';

        $wpdb->insert($table, [
            'jti' => $jti,
            'app_name' => $app_name,
            'expires_at' => $expires ? date('Y-m-d H:i:s', $expires) : null,
            'created_at' => current_time('mysql'),
            'revoked' => 0,
        ]);
    }

    /**
     * Check if API token is revoked
     */
    private static function isTokenRevoked($jti)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gateway_api_tokens';

        $revoked = $wpdb->get_var($wpdb->prepare(
            "SELECT revoked FROM $table WHERE jti = %s",
            $jti
        ));

        return (bool) $revoked;
    }

    /**
     * Revoke an API token
     */
    public static function revokeToken($jti)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'gateway_api_tokens';

        return $wpdb->update(
            $table,
            ['revoked' => 1],
            ['jti' => $jti]
        );
    }
}
```

### 4. Update Authentication Trait

**File: `lib/REST/RouteAuthenticationTrait.php:148-156`**

Replace the `validateJWT()` method with:

```php
protected function validateJWT()
{
    $authHeader = $this->getAuthHeader();

    if (!$authHeader || stripos($authHeader, 'bearer ') !== 0) {
        return new \WP_Error(
            'rest_jwt_malformed',
            'Bearer token header malformed',
            ['status' => 401]
        );
    }

    $token = trim(substr($authHeader, 7));

    if (empty($token)) {
        return new \WP_Error(
            'rest_jwt_missing',
            'Bearer token is empty',
            ['status' => 401]
        );
    }

    // Use JWTService to validate token
    $decoded = \Gateway\REST\JWTService::validateToken($token);

    if (is_wp_error($decoded)) {
        return $decoded;
    }

    // Store decoded token in request for later use
    // This allows permission checks to access token claims
    $GLOBALS['gateway_jwt_token'] = $decoded;

    // For USER tokens, set WordPress user context
    if ($decoded->type === 'user' && isset($decoded->user_id)) {
        wp_set_current_user($decoded->user_id);
    }

    return true;
}
```

### 5. Update Permission Checks

**File: `lib/REST/RoutePermissionTrait.php:34-43`**

Update `checkPublicSecured()` to allow same-site tokens:

```php
protected function checkPublicSecured()
{
    // Check if JWT token is present and is same_site type
    if (isset($GLOBALS['gateway_jwt_token'])) {
        $token = $GLOBALS['gateway_jwt_token'];

        // Allow same_site, user, and api tokens
        if (in_array($token->type, ['same_site', 'user', 'api'])) {
            return true;
        }
    }

    // Fall back to WordPress session check
    return is_user_logged_in() ? true : new \WP_Error(
        'rest_not_authenticated',
        __('User not authenticated.'),
        ['status' => 401]
    );
}
```

**File: `lib/REST/RoutePermissionTrait.php:51-89`**

Update `checkProtected()` to handle JWT tokens with capabilities:

```php
protected function checkProtected()
{
    // Check if JWT token is present
    if (isset($GLOBALS['gateway_jwt_token'])) {
        $token = $GLOBALS['gateway_jwt_token'];

        // API tokens have full access
        if ($token->type === 'api') {
            return true;
        }

        // Same-site tokens don't have access to protected routes
        if ($token->type === 'same_site') {
            return new \WP_Error(
                'rest_forbidden',
                __('Same-site tokens cannot access protected routes.'),
                ['status' => 403]
            );
        }

        // User tokens need capability check
        if ($token->type === 'user') {
            $routeType = $this->getType();

            $capabilityMap = [
                'create' => 'edit_posts',
                'update' => 'edit_posts',
                'delete' => 'delete_posts',
                'get_one' => 'read',
                'get_many' => 'read',
            ];

            $requiredCapability = $capabilityMap[$routeType] ?? 'read';

            // Check if user has required capability in token claims
            if (!isset($token->capabilities) ||
                !in_array($requiredCapability, $token->capabilities)) {
                return new \WP_Error(
                    'rest_forbidden',
                    sprintf(
                        __('You do not have permission to perform this action. Required capability: %s'),
                        $requiredCapability
                    ),
                    ['status' => 403]
                );
            }

            return true;
        }
    }

    // Fall back to WordPress session check
    if (!is_user_logged_in()) {
        return new \WP_Error(
            'rest_not_authenticated',
            __('User not authenticated.'),
            ['status' => 401]
        );
    }

    $currentUser = wp_get_current_user();
    $routeType = $this->getType();

    $capabilityMap = [
        'create' => 'edit_posts',
        'update' => 'edit_posts',
        'delete' => 'delete_posts',
        'get_one' => 'read',
        'get_many' => 'read',
    ];

    $requiredCapability = $capabilityMap[$routeType] ?? 'read';

    if (!$currentUser->has_cap($requiredCapability)) {
        return new \WP_Error(
            'rest_forbidden',
            sprintf(
                __('You do not have permission to perform this action. Required capability: %s'),
                $requiredCapability
            ),
            ['status' => 403]
        );
    }

    return true;
}
```

### 6. Token Issuance Endpoints

**File: `lib/REST/JWTAuthEndpoint.php`**

```php
<?php

namespace Gateway\REST;

class JWTAuthEndpoint
{
    public static function register()
    {
        // Issue same-site token (no auth required, validates origin)
        register_rest_route('gateway/v1', '/auth/token', [
            'methods' => 'GET',
            'callback' => [self::class, 'issueSameSiteToken'],
            'permission_callback' => '__return_true', // Validation happens in callback
        ]);

        // Login endpoint (username + password → user token)
        register_rest_route('gateway/v1', '/auth/login', [
            'methods' => 'POST',
            'callback' => [self::class, 'login'],
            'permission_callback' => '__return_true',
            'args' => [
                'username' => ['required' => true],
                'password' => ['required' => true],
            ],
        ]);

        // Refresh token endpoint (exchange valid token for new one)
        register_rest_route('gateway/v1', '/auth/refresh', [
            'methods' => 'POST',
            'callback' => [self::class, 'refreshToken'],
            'permission_callback' => '__return_true',
        ]);

        // Validate token endpoint (check if token is valid)
        register_rest_route('gateway/v1', '/auth/validate', [
            'methods' => 'GET',
            'callback' => [self::class, 'validateToken'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function issueSameSiteToken($request)
    {
        $token = JWTService::issueSameSiteToken();

        if (is_wp_error($token)) {
            return $token;
        }

        return new \WP_REST_Response([
            'success' => true,
            'token' => $token,
            'type' => 'same_site',
            'expires_in' => 3600,
        ]);
    }

    public static function login($request)
    {
        $username = $request->get_param('username');
        $password = $request->get_param('password');

        $user = wp_authenticate($username, $password);

        if (is_wp_error($user)) {
            return new \WP_Error(
                'login_failed',
                'Invalid username or password',
                ['status' => 401]
            );
        }

        $token = JWTService::issueUserToken($user->ID);

        if (is_wp_error($token)) {
            return $token;
        }

        return new \WP_REST_Response([
            'success' => true,
            'token' => $token,
            'type' => 'user',
            'user_id' => $user->ID,
            'user_login' => $user->user_login,
            'expires_in' => 86400,
        ]);
    }

    public static function refreshToken($request)
    {
        $authHeader = $request->get_header('Authorization');

        if (!$authHeader || stripos($authHeader, 'bearer ') !== 0) {
            return new \WP_Error(
                'missing_token',
                'Authorization header with Bearer token required',
                ['status' => 401]
            );
        }

        $token = trim(substr($authHeader, 7));
        $decoded = JWTService::validateToken($token);

        if (is_wp_error($decoded)) {
            return $decoded;
        }

        // Issue new token based on type
        switch ($decoded->type) {
            case 'same_site':
                $newToken = JWTService::issueSameSiteToken();
                $expiresIn = 3600;
                break;

            case 'user':
                $newToken = JWTService::issueUserToken($decoded->user_id);
                $expiresIn = 86400;
                break;

            case 'api':
                return new \WP_Error(
                    'cannot_refresh',
                    'API tokens cannot be refreshed. They must be regenerated.',
                    ['status' => 400]
                );

            default:
                return new \WP_Error('invalid_token_type', 'Unknown token type');
        }

        if (is_wp_error($newToken)) {
            return $newToken;
        }

        return new \WP_REST_Response([
            'success' => true,
            'token' => $newToken,
            'type' => $decoded->type,
            'expires_in' => $expiresIn,
        ]);
    }

    public static function validateToken($request)
    {
        $authHeader = $request->get_header('Authorization');

        if (!$authHeader || stripos($authHeader, 'bearer ') !== 0) {
            return new \WP_Error(
                'missing_token',
                'Authorization header with Bearer token required',
                ['status' => 401]
            );
        }

        $token = trim(substr($authHeader, 7));
        $decoded = JWTService::validateToken($token);

        if (is_wp_error($decoded)) {
            return $decoded;
        }

        return new \WP_REST_Response([
            'success' => true,
            'valid' => true,
            'type' => $decoded->type,
            'expires_at' => $decoded->exp,
            'issued_at' => $decoded->iat,
        ]);
    }
}
```

### 7. Database Schema

Create a table for API token management:

```sql
CREATE TABLE {prefix}_gateway_api_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    jti VARCHAR(36) NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    expires_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    revoked TINYINT(1) DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY jti (jti),
    KEY app_name (app_name),
    KEY expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8. Frontend Integration Example

**JavaScript/React client:**

```javascript
// TokenManager.js
class TokenManager {
  constructor() {
    this.tokenKey = 'gateway_token';
  }

  async ensureToken() {
    let token = localStorage.getItem(this.tokenKey);

    if (token) {
      // Check if token is still valid
      const isValid = await this.validateToken(token);
      if (isValid) {
        return token;
      }

      // Try to refresh
      const refreshed = await this.refreshToken(token);
      if (refreshed) {
        return refreshed;
      }
    }

    // Get new same-site token
    return await this.fetchSameSiteToken();
  }

  async fetchSameSiteToken() {
    const response = await fetch('/wp-json/gateway/v1/auth/token');
    const data = await response.json();

    if (data.success) {
      localStorage.setItem(this.tokenKey, data.token);
      return data.token;
    }

    throw new Error('Failed to obtain token');
  }

  async validateToken(token) {
    try {
      const response = await fetch('/wp-json/gateway/v1/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.success && data.valid;
    } catch (e) {
      return false;
    }
  }

  async refreshToken(token) {
    try {
      const response = await fetch('/wp-json/gateway/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem(this.tokenKey, data.token);
        return data.token;
      }
    } catch (e) {
      return null;
    }
  }

  async apiRequest(url, options = {}) {
    const token = await this.ensureToken();

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired, get new one and retry
      localStorage.removeItem(this.tokenKey);
      const newToken = await this.ensureToken();
      headers['Authorization'] = `Bearer ${newToken}`;

      return fetch(url, { ...options, headers });
    }

    return response;
  }
}

// Usage
const tokenManager = new TokenManager();

// Fetch data from public_secured route
const posts = await tokenManager.apiRequest('/wp-json/gateway/v1/posts');
const data = await posts.json();
```

## Security Considerations

### 1. Token Storage

**Same-site tokens:**
- ✅ Store in localStorage (short-lived, low risk)
- ✅ Auto-refresh before expiration

**User tokens:**
- ⚠️ Consider httpOnly cookies for sensitive apps
- ✅ localStorage acceptable for SPAs with proper CSP
- ✅ Include CSRF protection for state-changing operations

**API tokens:**
- ❌ NEVER expose in frontend code
- ✅ Store in environment variables
- ✅ Use in server-to-server communication only

### 2. Secret Key Management

**Best practice:**

Add to `wp-config.php`:
```php
define('GATEWAY_JWT_SECRET', 'your-256-bit-secret-key-here');
```

Generate with:
```bash
php -r "echo bin2hex(random_bytes(32));"
```

**Fallback:** Auto-generates and stores in database (less secure, but functional)

### 3. Rate Limiting

Implement rate limiting on token issuance endpoints:

```php
// In JWTAuthEndpoint.php
private static function checkRateLimit($ip, $endpoint)
{
    $key = "jwt_rate_limit_{$endpoint}_{$ip}";
    $attempts = (int) get_transient($key);

    if ($attempts >= 10) {
        return new \WP_Error(
            'rate_limit_exceeded',
            'Too many requests. Please try again later.',
            ['status' => 429]
        );
    }

    set_transient($key, $attempts + 1, 60); // 10 requests per minute
    return true;
}
```

### 4. Origin Validation

The `validateSameSiteRequest()` method checks:
- HTTP_REFERER header
- HTTP_ORIGIN header
- WordPress login state

**Note:** Headers can be spoofed, so same-site tokens should only access non-sensitive data.

### 5. Token Revocation

- API tokens support revocation via database table
- Same-site and user tokens are stateless (cannot be revoked)
- For critical security, implement token blacklist with Redis/Memcached

### 6. CORS Configuration

For same-site tokens to work properly:

```php
// In your main plugin file
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        $allowed_origin = home_url();

        if ($origin === $allowed_origin) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        }

        return $value;
    });
});
```

## Implementation Checklist

### Phase 1: Core JWT Implementation
- [ ] Install Firebase JWT library (`composer require firebase/php-jwt`)
- [ ] Create `JWTService.php` class
- [ ] Update `validateJWT()` in `RouteAuthenticationTrait.php`
- [ ] Update `checkPublicSecured()` and `checkProtected()` in `RoutePermissionTrait.php`
- [ ] Create database migration for `gateway_api_tokens` table
- [ ] Add JWT secret to `wp-config.php` or auto-generate

### Phase 2: Token Issuance
- [ ] Create `JWTAuthEndpoint.php` class
- [ ] Register token endpoints in WordPress REST API
- [ ] Test same-site token issuance
- [ ] Test user token issuance (login endpoint)
- [ ] Test token validation endpoint
- [ ] Test token refresh endpoint

### Phase 3: Frontend Integration
- [ ] Create JavaScript token manager utility
- [ ] Integrate with existing API calls
- [ ] Handle token expiration and refresh
- [ ] Add error handling for auth failures

### Phase 4: API Token Management (Optional)
- [ ] Create admin UI for generating API tokens
- [ ] Add WP-CLI command for token generation
- [ ] Implement token revocation
- [ ] Add token listing/management page

### Phase 5: Security Hardening
- [ ] Add rate limiting to token endpoints
- [ ] Implement logging for token issuance
- [ ] Add token usage metrics
- [ ] Set up monitoring for suspicious activity
- [ ] Document security best practices

## Migration Path

### Option 1: Gradual Rollout
1. Deploy JWT code (validation only, no frontend changes)
2. Test with Postman/curl
3. Update frontend to request same-site tokens
4. Monitor usage and errors
5. Document for other developers

### Option 2: Parallel Authentication
- Keep existing Cookie and Basic Auth
- Add JWT as third option
- Gradually migrate frontend to JWT
- Eventually deprecate Basic Auth for browser clients

## Testing Strategy

### Unit Tests
```php
// Test token issuance
test_issue_same_site_token()
test_issue_user_token()
test_issue_api_token()

// Test validation
test_valid_token()
test_expired_token()
test_invalid_signature()
test_revoked_token()

// Test permissions
test_same_site_token_public_secured_access()
test_same_site_token_protected_denied()
test_user_token_capability_check()
test_api_token_full_access()
```

### Integration Tests
```bash
# Get same-site token
curl -X GET https://yoursite.com/wp-json/gateway/v1/auth/token \
  -H "Referer: https://yoursite.com"

# Use token to access public_secured route
curl -X GET https://yoursite.com/wp-json/gateway/v1/posts \
  -H "Authorization: Bearer <token>"

# Login to get user token
curl -X POST https://yoursite.com/wp-json/gateway/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use user token for protected route
curl -X POST https://yoursite.com/wp-json/gateway/v1/posts \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Post"}'
```

## FAQ

**Q: Can same-site tokens be used for POST/PUT/DELETE?**
A: Yes, but they only work with `public_secured` routes. For `protected` routes (like create/update/delete), you need a user or API token.

**Q: How do I generate API tokens?**
A: Use WP-CLI: `wp gateway token create "My App"` or use the admin UI (to be built in Phase 4).

**Q: What if my secret key is compromised?**
A: Generate a new secret, update `wp-config.php`, and all existing tokens will be invalidated.

**Q: Can I use JWT with mobile apps?**
A: Yes! Use the login endpoint to exchange credentials for a user token, then store it securely (Keychain on iOS, Keystore on Android).

**Q: How do I log out?**
A: Simply delete the token from storage. JWT tokens are stateless, so there's no server-side session to destroy. For API tokens, use the revocation endpoint.

**Q: What about refresh tokens?**
A: The `/auth/refresh` endpoint allows exchanging a valid token for a new one. For more security, implement a separate refresh token flow with longer expiration.

## Conclusion

This JWT implementation provides a flexible, secure authentication system that solves your same-site access problem while maintaining compatibility with existing authentication methods.

**Key benefits:**
- ✅ Anonymous users can access `public_secured` routes from your domain
- ✅ Single token works across all API routes
- ✅ No WordPress login required for same-site access
- ✅ Backward compatible with Cookie and Basic Auth
- ✅ Scalable for mobile apps and external services
- ✅ Built on industry-standard JWT technology

**Next steps:**
1. Review this proposal with your team
2. Decide on implementation phases
3. Set up development environment
4. Begin Phase 1 implementation
5. Test thoroughly before production deployment
