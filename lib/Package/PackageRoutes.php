<?php

namespace Gateway\Package;


if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST routes for runtime-registered packages.
 *
 * These are PHP-coded packages (and Raptor DB packages whose extension plugin
 * is active) that have been registered with PackageRegistry via register().
 *
 * For Raptor editor CRUD (create / update / delete DB packages) use the
 * Raptor\Endpoints\PackageRoutes routes instead — those two concerns are
 * intentionally kept separate.
 *
 * Endpoints:
 *   GET  /gateway/v1/packages/registered   — list all registered packages
 *   GET  /gateway/v1/packages/registered/{key} — get one registered package
 */
class PackageRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/packages/registered', [
            'methods'             => 'GET',
            'callback'            => [$this, 'getRegistered'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/packages/registered/(?P<key>[a-zA-Z0-9_\-]+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'getOne'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);
    }

    public function getRegistered(\WP_REST_Request $request): \WP_REST_Response
    {
        $registry = \Gateway\Plugin::getInstance()->getPackageRegistry();

        if ($registry === null) {
            return new \WP_REST_Response(['success' => true, 'total' => 0, 'packages' => []], 200);
        }

        $packages = array_map(
            fn(Package $pkg) => $this->serialize($pkg),
            array_values($registry->getAll())
        );

        usort($packages, fn($a, $b) => strcmp($a['key'], $b['key']));

        return new \WP_REST_Response([
            'success'  => true,
            'total'    => count($packages),
            'packages' => $packages,
        ], 200);
    }

    public function getOne(\WP_REST_Request $request): \WP_REST_Response
    {
        $registry = \Gateway\Plugin::getInstance()->getPackageRegistry();
        $key      = $request->get_param('key');

        if ($registry === null || !$registry->has($key)) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Package not found.'], 404);
        }

        return new \WP_REST_Response([
            'success' => true,
            'package' => $this->serialize($registry->get($key)),
        ], 200);
    }

    private function serialize(Package $pkg): array
    {
        $collections = $pkg->getCollections();

        // Normalize collections to a flat array of keys regardless of how
        // the package author stored them (keys, objects, or mixed).
        $collectionKeys = array_values(array_filter(array_map(function ($c) {
            if (is_string($c)) return $c;
            if (is_object($c) && method_exists($c, 'getKey')) return $c->getKey();
            if (is_array($c) && isset($c['collection_key'])) return $c['collection_key'];
            if (is_array($c) && isset($c['key'])) return $c['key'];
            return null;
        }, $collections)));

        return [
            'key'                 => $pkg->getKey(),
            'label'               => $pkg->getLabel(),
            'description'         => $pkg->getDescription(),
            'icon'                => $pkg->getIcon(),
            'position'            => $pkg->getPosition(),
            'capability'          => $pkg->getCapability(),
            'parent'              => $pkg->getParent(),
            'menu_slug'           => $pkg->getMenuSlug(),
            'is_top_level'        => $pkg->isTopLevel(),
            'is_database_package' => $pkg instanceof DatabasePackage,
            'collection_keys'     => $collectionKeys,
            'collections_count'   => count($collectionKeys),
        ];
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
