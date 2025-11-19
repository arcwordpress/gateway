<?php

namespace Gateway\Endpoints;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use Gateway\Collection;

abstract class BaseEndpoint
{
    protected $collection;
    protected $collectionName;

    public function __construct(Collection $collection, $collectionName)
    {
        $this->collection = $collection;
        $this->collectionName = $collectionName;
    }

    abstract public function getMethod();
    abstract public function getRoute();
    abstract public function handle(WP_REST_Request $request);

    abstract public function getType();

    public function getNamespace()
    {
        return $this->collection->getRestNamespace();
    }

    public function getFullRoute()
    {
        return $this->getNamespace() . '/' . $this->collectionName . $this->getRoute();
    }

    public function getArgs()
    {
        return [
            'methods' => $this->getMethod(),
            'callback' => [$this, 'handle'],
            'permission_callback' => [$this, 'checkPermissions'], // Custom permission check for testing
        ];
    }

    public function checkPermissions($request)
    {
        // Get route configuration
        $routeConfig = $this->collection->getRoutes();
        $permissions = $routeConfig['permissions'] ?? [];
        $routeType = $this->getType();
        $allowBasicAuth = $routeConfig['allow_basic_auth'] ?? true;

        // Step 1: Check Basic Auth (if enabled) - returns immediately if valid or invalid credentials provided
        if ($allowBasicAuth) {
            $result = $this->doBasicAuthCheck($request, $permissions, $routeType);
            if ($result !== null) {
                return $result; // Basic auth handled (success or failure), return immediately
            }
            // null means no Basic Auth attempted, continue to permission type check
        }

        // Step 2: Get permission configuration for this route
        $permissionConfig = $this->getPermissionConfig($permissions, $routeType);

        // Step 3: Check if public access
        $result = $this->doPublicAccessCheck($permissionConfig);
        if ($result !== null) {
            return $result; // Public access allowed or default login required
        }

        // Step 4: Normalize permission config and route to auth handler
        return $this->doPermissionTypeCheck($permissionConfig);
    }

    /**
     * Check Basic Authentication
     *
     * @return mixed Returns WP_Error on failure, true on success, null if no Basic Auth attempted
     */
    protected function doBasicAuthCheck($request, $permissions, $routeType)
    {
        $basicAuthResult = $this->checkBasicAuthentication($request);

        // Basic Auth succeeded - check capabilities and return immediately
        if ($basicAuthResult === true) {
            return $this->checkCapabilityRequirements($permissions, $routeType);
        }

        // Basic Auth failed with credentials provided - return error immediately
        if (is_wp_error($basicAuthResult) && $this->hasBasicAuthHeaders($request)) {
            return $basicAuthResult;
        }

        // No Basic Auth attempted - continue to permission type check
        return null;
    }

    /**
     * Get permission configuration for the current route
     *
     * @return mixed Permission config (array, string, false, or null)
     */
    protected function getPermissionConfig($permissions, $routeType)
    {
        // Check for route-specific permission
        if (isset($permissions[$routeType])) {
            return $permissions[$routeType];
        }

        // Fall back to wildcard
        if (isset($permissions['*'])) {
            return $permissions['*'];
        }

        // No permission config found
        return null;
    }

    /**
     * Check if this is public access or no permission config
     *
     * @return mixed Returns true/WP_Error if handled, null to continue
     */
    protected function doPublicAccessCheck($permissionConfig)
    {
        // No permission config = require login by default
        if ($permissionConfig === null) {
            if (!is_user_logged_in()) {
                return new WP_Error(
                    'rest_forbidden',
                    'You must be logged in to access this resource.',
                    ['status' => rest_authorization_required_code()]
                );
            }
            return true;
        }

        // Public access (permission set to false)
        if ($permissionConfig === false) {
            return true;
        }

        // Not public, continue to permission type check
        return null;
    }

    /**
     * Check permission type and route to appropriate auth handler
     *
     * @return mixed WP_Error or true
     */
    protected function doPermissionTypeCheck($permissionConfig)
    {
        // Normalize string format to array
        if (is_string($permissionConfig)) {
            $permissionConfig = [
                'type' => 'cookie_authentication',
                'settings' => [
                    'capability' => $permissionConfig
                ]
            ];
        }

        // Get auth type and settings
        $authType = $permissionConfig['type'] ?? 'cookie_authentication';
        $settings = $permissionConfig['settings'] ?? [];

        // Route to appropriate auth handler
        switch ($authType) {
            case 'cookie_authentication':
                return $this->checkCookieAuthentication($settings);

            case 'nonce_only':
                return $this->checkNonceOnly($settings);

            case 'jwt':
                return $this->checkJWTAuthentication($settings);

            default:
                return new WP_Error(
                    'invalid_auth_type',
                    sprintf('Unknown authentication type: %s', $authType),
                    ['status' => 500]
                );
        }
    }

    protected function hasBasicAuthHeaders($request)
    {
        return !empty($_SERVER['PHP_AUTH_USER']) || !empty($request->get_header('authorization'));
    }

    protected function checkBasicAuthentication($request)
    {
        // Check if Authorization header exists
        $authorization = $request->get_header('authorization');

        if (empty($authorization) && empty($_SERVER['PHP_AUTH_USER'])) {
            return false; // No basic auth attempted
        }

        // Parse Basic Auth credentials
        $username = null;
        $password = null;

        if (!empty($_SERVER['PHP_AUTH_USER'])) {
            $username = $_SERVER['PHP_AUTH_USER'];
            $password = $_SERVER['PHP_AUTH_PW'] ?? '';
        } elseif (!empty($authorization)) {
            // Parse Authorization: Basic base64(username:password)
            if (stripos($authorization, 'Basic ') === 0) {
                $credentials = base64_decode(substr($authorization, 6));
                if ($credentials && strpos($credentials, ':') !== false) {
                    list($username, $password) = explode(':', $credentials, 2);
                }
            }
        }

        if (empty($username) || empty($password)) {
            return new WP_Error(
                'rest_forbidden',
                'Invalid Basic Authentication credentials format.',
                ['status' => 401]
            );
        }

        // Authenticate using WordPress Application Passwords
        $user = wp_authenticate_application_password(null, $username, $password);

        if (is_wp_error($user)) {
            return new WP_Error(
                'rest_forbidden',
                'Invalid username or application password.',
                ['status' => 401]
            );
        }

        if (!$user) {
            return new WP_Error(
                'rest_forbidden',
                'Invalid username or application password.',
                ['status' => 401]
            );
        }

        // Set the current user
        wp_set_current_user($user->ID);

        return true;
    }

    protected function checkCapabilityRequirements($permissions, $routeType)
    {
        // Determine which permission config to use
        $permissionConfig = null;

        if (isset($permissions[$routeType])) {
            $permissionConfig = $permissions[$routeType];
        } elseif (isset($permissions['*'])) {
            $permissionConfig = $permissions['*'];
        }

        // No permission config or public access
        if (!$permissionConfig || $permissionConfig === false) {
            return true;
        }

        // Get capability requirement
        $settings = $permissionConfig['settings'] ?? [];
        $capability = $settings['capability'] ?? null;

        if (!$capability) {
            return true; // No specific capability required
        }

        // Check if user has required capability
        if (!current_user_can($capability)) {
            return new WP_Error(
                'rest_forbidden',
                sprintf('You need the "%s" capability to perform this action.', $capability),
                ['status' => 403]
            );
        }

        return true;
    }

    protected function checkCookieAuthentication($settings)
    {
        // Check nonce for cookie authentication (CSRF protection)
        $nonce = null;

        // Check for nonce in header first (standard for REST API)
        if (isset($_SERVER['HTTP_X_WP_NONCE'])) {
            $nonce = $_SERVER['HTTP_X_WP_NONCE'];
        }

        // Fall back to _wpnonce parameter
        if (!$nonce && isset($_REQUEST['_wpnonce'])) {
            $nonce = $_REQUEST['_wpnonce'];
        }

        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error(
                'rest_cookie_invalid_nonce',
                'Cookie nonce is invalid',
                ['status' => 403]
            );
        }

        $capability = $settings['capability'] ?? null;

        // If no capability specified, just require login
        if (!$capability) {
            if (!is_user_logged_in()) {
                return new WP_Error(
                    'rest_forbidden',
                    'You must be logged in to access this resource.',
                    ['status' => rest_authorization_required_code()]
                );
            }
            return true;
        }

        // Check if user has required capability
        if (!current_user_can($capability)) {
            $message = is_user_logged_in()
                ? sprintf('You need the "%s" capability to perform this action.', $capability)
                : 'You must be logged in to access this resource.';

            return new WP_Error(
                'rest_forbidden',
                $message,
                ['status' => rest_authorization_required_code()]
            );
        }

        return true;
    }

    protected function checkNonceOnly($settings)
    {
        // Check for nonce only, no user login required
        // This allows WordPress frontend access without requiring authentication
        $nonce = null;

        // Check for nonce in header first (standard for REST API)
        if (isset($_SERVER['HTTP_X_WP_NONCE'])) {
            $nonce = $_SERVER['HTTP_X_WP_NONCE'];
        }

        // Fall back to _wpnonce parameter
        if (!$nonce && isset($_REQUEST['_wpnonce'])) {
            $nonce = $_REQUEST['_wpnonce'];
        }

        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error(
                'rest_nonce_invalid',
                'Nonce is invalid or missing',
                ['status' => 403]
            );
        }

        // Nonce is valid, no user login required
        return true;
    }

    protected function checkJWTAuthentication($settings)
    {
        // Placeholder for future JWT implementation
        return new WP_Error(
            'not_implemented',
            'JWT authentication is not yet implemented.',
            ['status' => 501]
        );
    }

    protected function sendSuccessResponse($data, $status = 200)
    {
        return new WP_REST_Response([
            'success' => true,
            'data' => $data
        ], $status);
    }

    protected function sendErrorResponse($message, $code = 'error', $status = 400)
    {
        return new WP_Error($code, $message, ['status' => $status]);
    }

    protected function sendMockResponse($operation, $data = null)
    {
        $mockData = [
            'operation' => $operation,
            'collection' => $this->collectionName,
            'timestamp' => current_time('mysql'),
            'mock' => true
        ];

        if ($data) {
            $mockData['input'] = $data;
        }

        switch ($operation) {
            case 'get_one':
                $mockData['result'] = [
                    'id' => 1,
                    'title' => 'Sample ' . ucfirst($this->collectionName),
                    'status' => 'active',
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql')
                ];
                break;
            case 'get_many':
                $mockData['result'] = [
                    'items' => [
                        [
                            'id' => 1,
                            'title' => 'Sample ' . ucfirst($this->collectionName) . ' 1',
                            'status' => 'active',
                            'created_at' => current_time('mysql'),
                            'updated_at' => current_time('mysql')
                        ],
                        [
                            'id' => 2,
                            'title' => 'Sample ' . ucfirst($this->collectionName) . ' 2',
                            'status' => 'active',
                            'created_at' => current_time('mysql'),
                            'updated_at' => current_time('mysql')
                        ]
                    ],
                    'total' => 2,
                    'page' => 1,
                    'per_page' => 10
                ];
                break;
            case 'create':
                $mockData['result'] = array_merge([
                    'id' => wp_rand(100, 999),
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql')
                ], $data ?: []);
                break;
            case 'update':
                $mockData['result'] = array_merge([
                    'id' => $data['id'] ?? 1,
                    'updated_at' => current_time('mysql')
                ], $data ?: []);
                break;
            case 'delete':
                $mockData['result'] = [
                    'deleted' => true,
                    'id' => $data['id'] ?? 1
                ];
                break;
        }

        return $this->sendSuccessResponse($mockData);
    }

    public function getCollectionName()
    {
        return $this->collectionName;
    }

}
