<?php

namespace Gateway\REST;

trait RoutePermissionTrait
{
    /**
     * Parse the permission type for the current route type.
     *
     * @param array $permissions
     * @return string Permission type
     */
    protected function parsePermissionType($permissions)
    {
        $routeType = $this->getType();
        
        // Check if permission is explicitly defined for this route type
        if (isset($permissions[$routeType]['type'])) {
            return $permissions[$routeType]['type'];
        }
        
        // Fall back to the route's default permission
        return method_exists($this, 'getDefaultRoutePermission') 
            ? $this->getDefaultRoutePermission() 
            : 'protected';
    }

    /**
     * Check public_secured permission type
     * Requires valid authentication but no specific WordPress capabilities
     * 
     * @return true|\WP_Error
     */
    protected function checkPublicSecured()
    {
        // Authentication already validated by checkAuthentication()
        // Just verify we have a valid user session
        return is_user_logged_in() ? true : new \WP_Error(
            'rest_not_authenticated',
            __('User not authenticated.'),
            ['status' => 401]
        );
    }

    /**
     * Check protected permission type
     * Requires valid authentication AND specific permissions/capabilities
     * 
     * @return true|\WP_Error
     */
    protected function checkProtected()
    {
        // Authentication already validated by checkAuthentication()
        
        if (!is_user_logged_in()) {
            return new \WP_Error(
                'rest_not_authenticated',
                __('User not authenticated.'),
                ['status' => 401]
            );
        }
        
        $currentUser = wp_get_current_user();
        $routeType = $this->getType();
        
        // Map route types to required capabilities
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

    /**
     * Check if the current authentication method bypasses WordPress permission checks
     * Basic Auth and JWT are considered "external" auth methods that don't use WP sessions
     * 
     * @return bool
     */
    protected function isExternalAuthMethod()
    {
        if (!method_exists($this, 'detectAuthMethod')) {
            return false;
        }
        
        $authMethod = $this->detectAuthMethod();
        return in_array($authMethod, ['basic', 'jwt'], true);
    }
}