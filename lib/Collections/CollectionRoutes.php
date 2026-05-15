<?php

namespace Gateway\Collections;

use Gateway\REST\RouteAuthenticationTrait;

class CollectionRoutes
{
    use RouteAuthenticationTrait;

    private CollectionController $controller;

    public function __construct()
    {
        $this->controller = new CollectionController();
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/collections', [
            'methods'             => 'GET',
            'callback'            => [$this->controller, 'getMany'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'package' => [
                    'required'    => false,
                    'type'        => 'string',
                    'description' => 'Filter collections by package name',
                ],
                'include_private' => [
                    'required'    => false,
                    'type'        => 'boolean',
                    'default'     => false,
                    'description' => 'When true, include core and private collections in the response.',
                ],
            ],
        ]);

        register_rest_route('gateway/v1', '/collections/(?P<key>[a-zA-Z0-9_\-]+)', [
            'methods'             => 'GET',
            'callback'            => [$this->controller, 'getOne'],
            'permission_callback' => '__return_true',
            'args' => [
                'key' => [
                    'required' => true,
                    'type'     => 'string',
                    'pattern'  => '^[a-zA-Z0-9_\-]+$',
                ],
            ],
        ]);
    }

    public function checkPermission()
    {
        $authResult = $this->checkAuthentication();

        if (is_wp_error($authResult)) {
            return $authResult;
        }

        return is_user_logged_in() ? true : new \WP_Error(
            'rest_not_authenticated',
            __('User not authenticated.'),
            ['status' => 401]
        );
    }
}
