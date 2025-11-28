<?php

namespace Gateway\Endpoints;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use Gateway\Collection;
use Gateway\PermissionChecksTrait;
use Gateway\REST\RequestLog;

abstract class BaseEndpoint
{
    use PermissionChecksTrait;

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

    /**
     * Get the type of this endpoint route.
     *
     * Standard route types include:
     *   - "get_many"   : Retrieve a collection of items
     *   - "get_one"    : Retrieve a single item
     *   - "create"     : Create a new item
     *   - "update"     : Update an existing item
     *   - "delete"     : Delete an item
     *
     * Custom types may be returned for non-standard routes.
     *
     * @return string The route type identifier.
     */
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
        $routeConfig      = $this->collection->getRoutes();
        $permissionsArray = $routeConfig['permissions'] ?? [];
        $permissionType   = $this->parsePermissionType($permissionsArray);

        if ($permissionType === null) {
            return new \WP_Error(
                'missing_permission_type',
                sprintf(
                    'Cannot determine the permission type for the route "%s". Collections must define a structured permissions array with a permission type (string or array) for each registered route type.',
                    $this->getType()
                ),
                ['status' => 500]
            );
        }

        if ($permissionType === 'public') {
            return true;
        }

        switch ($permissionType) {
            case 'public_secured':
                return $this->checkPublicSecured();
            case 'protected':
                return $this->checkProtected();
            default:
                return new WP_Error(
                    'invalid_permission_type',
                    sprintf('Unknown permission type: %s each route must have a permission type (string) and we either could not find it or it was not on the approved list of permission types.', $permissionType),
                    ['status' => 500]
                );
        }
    }

    /**
     * Parse the permission type for the current route type.
     *
     * @param array $permissions
     * @return mixed Permission config (array, string, false, or null)
     */
    protected function parsePermissionType($permissions)
    {
        $routeType = $this->getType();

        // Only check for route-specific permission, no wildcard
        return $permissions[$routeType]['type'] ?? 'protected';
    }

    protected function checkPublicSecured()
    {
        $nonce = null;

        // Try to get nonce from the X-WP-Nonce header
        if ( isset( $_SERVER['HTTP_X_WP_NONCE'] ) ) {
            $nonce = $_SERVER['HTTP_X_WP_NONCE'];
        } elseif ( isset( $_REQUEST['_wpnonce'] ) ) {
            // Fallback to _wpnonce param if present
            $nonce = $_REQUEST['_wpnonce'];
        }

        if ( $nonce && wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return true;
        }

        return new \WP_Error(
            'rest_invalid_nonce',
            __( 'Invalid or missing nonce.' ),
            [ 'status' => 403 ]
        );
    }

    protected function checkProtected()
    {
        return $this->checkProtectedPermission();
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

    public function getCollectionName()
    {
        return $this->collectionName;
    }

    public function handleRequest($request)
    {
        $start = microtime(true);
        $response = $this->handle($request);
        $ms = (int)((microtime(true) - $start) * 1000);

        RequestLog::log(
            $this->getFullRoute(),
            $request->get_method(),
            get_current_user_id(),
            is_wp_error($response) ? $response->get_error_code() : 200,
            $ms
        );

        return $response;
    }
}
