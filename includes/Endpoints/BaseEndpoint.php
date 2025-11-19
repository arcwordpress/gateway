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

        // Step 1: Check Basic Auth - always check, returns immediately if valid or invalid credentials provided
        $result = $this->doBasicAuthCheck($request, $permissions, $routeType);
        if ($result !== null) {
            return $result; // Basic auth handled (success or failure), return immediately
        }
        // null means no Basic Auth attempted, continue to permission type check

        // Step 2: Get permission configuration for this route
        $permissionConfig = $this->getPermissionConfig($permissions, $routeType);

        // Step 3: Check if public access
        $result = $this->doPublicAccessCheck($permissionConfig);
        if ($result !== null) {
            return $result; // Public access allowed or default login required
        }

        // Step 4: Normalize permission config and route to auth handler
        return $this->doPermissionTypeCheck($permissionConfig, $request);
    }

    /**
     * Check Basic Authentication
     *
     * @return mixed Returns WP_Error on failure, true on success, null if no Basic Auth attempted
     */
    protected function doBasicAuthCheck($request, $permissions, $routeType)
    {
        $basicAuthResult = $this->checkBasicAuthentication($request);

        // Basic Auth succeeded - return immediately
        if ($basicAuthResult === true) {
            return true;
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
    protected function doPermissionTypeCheck($permissionConfig, $request)
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
            case 'public':
                return true; // No authentication required

            case 'public_secured':
                return $this->checkPublicSecured($settings);

            case 'protected':
                return $this->checkProtected($settings);

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

    protected function checkPublicSecured($settings)
    {
        // public_secured: Validate nonce only, no user authentication required
        $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? $_REQUEST['_wpnonce'] ?? null;

        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error(
                'rest_nonce_invalid',
                'Nonce is invalid or missing',
                ['status' => 403]
            );
        }

        return true;
    }

    protected function checkProtected($settings)
    {
        // protected: User must be authenticated (cookie or Basic Auth already handled)
        // Basic Auth check already ran in doBasicAuthCheck(), so if we're here user might be
        // authenticated via cookie. Just validate nonce and capability.

        $nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? $_REQUEST['_wpnonce'] ?? null;

        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error(
                'rest_nonce_invalid',
                'Nonce is invalid or missing',
                ['status' => 403]
            );
        }

        // Check capability requirement
        $capability = $settings['capability'] ?? null;

        if ($capability && !current_user_can($capability)) {
            return new WP_Error(
                'rest_forbidden',
                sprintf('You need the "%s" capability to perform this action.', $capability),
                ['status' => 403]
            );
        }

        return true;
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
