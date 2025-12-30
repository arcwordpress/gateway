<?php

namespace Gateway\REST;

trait RouteAuthenticationTrait
{
    /**
     * Detect which authentication method is being attempted
     * 
     * @return string 'none'|'cookie'|'basic'|'jwt'
     */
    protected function detectAuthMethod()
    {
        $authHeader = $this->getAuthHeader();
        
        // Check for JWT (Bearer token)
        if ($authHeader && stripos($authHeader, 'bearer ') === 0) {
            return 'jwt';
        }
        
        // Check for Basic Auth
        if ($authHeader && stripos($authHeader, 'basic ') === 0) {
            return 'basic';
        }
        
        // Check for Cookie Auth attempt (presence of nonce indicates intent)
        $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? $_REQUEST['_wpnonce'] ?? null;
        if ($nonce) {
            return 'cookie';
        }
        
        return 'none';
    }
    
    /**
     * Validate authentication credentials (does NOT check permissions)
     * 
     * @return true|\WP_Error True if authenticated, WP_Error otherwise
     */
    public function checkAuthentication()
    {
        $authMethod = $this->detectAuthMethod();
        
        switch ($authMethod) {
            case 'cookie':
                return $this->validateCookieAuth();
                
            case 'basic':
                return $this->validateBasicAuth();
                
            case 'jwt':
                return $this->validateJWT();
                
            case 'none':
            default:
                return new \WP_Error(
                    'rest_auth_required',
                    'Authentication required. Provide valid credentials via Cookie (session + nonce), Basic Auth (Application Password), or JWT.',
                    ['status' => 401]
                );
        }
    }

    /**
     * Validate cookie-based authentication (WordPress session + nonce)
     * 
     * @return true|\WP_Error
     */
    protected function validateCookieAuth()
    {
        if (!is_user_logged_in()) {
            return new \WP_Error(
                'rest_cookie_invalid_session',
                'No valid WordPress session found',
                ['status' => 401]
            );
        }
        
        $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? $_REQUEST['_wpnonce'] ?? null;
        
        if (!$nonce) {
            return new \WP_Error(
                'rest_cookie_missing_nonce',
                'Cookie authentication requires a valid nonce',
                ['status' => 403]
            );
        }
        
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'rest_cookie_invalid_nonce',
                'Cookie authentication failed. Invalid nonce',
                ['status' => 403]
            );
        }
        
        return true;
    }

    /**
     * Validate Basic Auth (Application Password)
     * 
     * @return true|\WP_Error
     */
    protected function validateBasicAuth()
    {
        $authHeader = $this->getAuthHeader();
        
        if (!$authHeader || stripos($authHeader, 'basic ') !== 0) {
            return new \WP_Error(
                'rest_basic_malformed',
                'Basic Auth header malformed',
                ['status' => 401]
            );
        }
        
        $encoded = substr($authHeader, 6);
        $decoded = base64_decode($encoded);
        
        if (!$decoded || strpos($decoded, ':') === false) {
            return new \WP_Error(
                'rest_basic_invalid_format',
                'Basic Auth credentials invalid format',
                ['status' => 401]
            );
        }
        
        list($user, $pass) = explode(':', $decoded, 2);
        
        $result = wp_authenticate_application_password(null, $user, $pass);
        
        if ($result && !is_wp_error($result)) {
            return true;
        }
        
        return new \WP_Error(
            'rest_basic_invalid_credentials',
            'Invalid Application Password credentials',
            ['status' => 403]
        );
    }
    
    /**
     * Validate JWT (Bearer token)
     * 
     * @return true|\WP_Error
     */
    protected function validateJWT()
    {
        // TODO: Implement JWT validation
        return new \WP_Error(
            'rest_jwt_not_implemented',
            'JWT authentication not yet implemented',
            ['status' => 501]
        );
    }

    /**
     * Get the Authorization header from various server locations
     * 
     * @return string|null
     */
    protected function getAuthHeader()
    {
        // Modern standard - this SHOULD always work
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }
        
        // Fallback for Apache rewrites (common in shared hosting)
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        
        // Legacy PHP CGI fallback - reconstruct header
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $user = $_SERVER['PHP_AUTH_USER'];
            $pass = $_SERVER['PHP_AUTH_PW'] ?? '';
            return 'Basic ' . base64_encode("$user:$pass");
        }
        
        return null;
    }
}