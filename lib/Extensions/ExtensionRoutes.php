<?php

namespace Gateway\Extensions;

if (!defined('ABSPATH')) {
    exit;
}

class ExtensionRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/extensions/registered', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getRegistered'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    public function getRegistered(\WP_REST_Request $request): \WP_REST_Response
    {
        $registry = ExtensionRegistry::instance();
        $all      = $registry->getAll();

        $extensions = [];

        foreach ($all as $extension) {
            if (!$extension instanceof \Gateway\Extension) {
                continue;
            }

            $extensions[] = [
                'key'         => $extension->getKey(),
                'title'       => $extension->getTitle(),
                'class'       => get_class($extension),
                'class_name'  => class_basename(get_class($extension)),
                'plugin_slug' => method_exists($extension, 'getPluginSlug') ? $extension->getPluginSlug() : null,
                'plugin_path' => method_exists($extension, 'getPluginPath') ? $extension->getPluginPath() : null,
            ];
        }

        usort($extensions, fn($a, $b) => strcmp($a['key'], $b['key']));

        return new \WP_REST_Response([
            'success'    => true,
            'total'      => count($extensions),
            'extensions' => $extensions,
        ], 200);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
