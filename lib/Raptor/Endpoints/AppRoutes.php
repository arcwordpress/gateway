<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Apps\AppRegistry;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST endpoints for registered Gateway Apps.
 *
 * Endpoints:
 *   GET /gateway/v1/apps — list all apps registered via App::register()
 */
class AppRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/apps', [
            'methods'             => 'GET',
            'callback'            => [$this, 'getApps'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);
    }

    public function getApps(\WP_REST_Request $request): \WP_REST_Response
    {
        $apps = AppRegistry::getAll();

        $data = array_values(array_map(function ($app) {
            // Find WP pages assigned to this app's template
            $pages = get_posts([
                'post_type'   => 'page',
                'post_status' => 'publish',
                'numberposts' => -1,
                'meta_query'  => [[
                    'key'   => '_wp_page_template',
                    'value' => $app->getTemplateSlug(),
                ]],
            ]);

            $assignedPages = array_map(fn($p) => [
                'id'        => $p->ID,
                'title'     => get_the_title($p->ID),
                'permalink' => get_permalink($p->ID),
                'slug'      => $p->post_name,
            ], $pages);

            return [
                'key'           => $app->getKey(),
                'label'         => $app->getLabel(),
                'template_slug' => $app->getTemplateSlug(),
                'mount_id'      => $app->getMountId(),
                'localize_key'  => $app->getLocalizeKey(),
                'assigned_pages' => $assignedPages,
            ];
        }, $apps));

        return new \WP_REST_Response(['apps' => $data], 200);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
