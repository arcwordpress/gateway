<?php

namespace Gateway\Packages;

use Gateway\Package;
use Gateway\Raptor\Packages\DatabasePackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST routes for runtime-registered packages.
 *
 * Lists packages registered via PackageRegistry (code-defined and Raptor DB-backed).
 * For Raptor CRUD (create/update/delete) use Raptor\Endpoints\PackageRoutes instead.
 *
 * GET /gateway/v1/packages/registered
 * GET /gateway/v1/packages/registered/{key}
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

        // Build a package_key => [collection_keys] map in one pass to avoid N+1.
        // Collections declare their package via getPackage(); the Package object
        // never holds a back-reference, so we resolve this from the collection side.
        $collectionsByPackage = [];
        $collectionRegistry = \Gateway\Plugin::getInstance()->getRegistry();
        if ($collectionRegistry !== null) {
            foreach ($collectionRegistry->getAll() as $collection) {
                $pkgKey = method_exists($collection, 'getPackage') ? $collection->getPackage() : null;
                if ($pkgKey) {
                    $collectionsByPackage[$pkgKey][] = method_exists($collection, 'getCollectionKey')
                        ? $collection->getCollectionKey()
                        : (is_string($collection) ? $collection : null);
                }
            }
        }

        $packages = array_map(
            fn(Package $pkg) => $this->serialize($pkg, $collectionsByPackage[$pkg->getKey()] ?? []),
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

        $collectionKeys = [];
        $collectionRegistry = \Gateway\Plugin::getInstance()->getRegistry();
        if ($collectionRegistry !== null) {
            foreach ($collectionRegistry->getAll() as $collection) {
                if (method_exists($collection, 'getPackage') && $collection->getPackage() === $key) {
                    $collectionKeys[] = method_exists($collection, 'getCollectionKey') ? $collection->getCollectionKey() : null;
                }
            }
        }

        return new \WP_REST_Response([
            'success' => true,
            'package' => $this->serialize($registry->get($key), array_filter($collectionKeys)),
        ], 200);
    }

    private function serialize(Package $pkg, array $collectionKeys = []): array
    {
        $collectionKeys = array_values(array_filter($collectionKeys));

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
