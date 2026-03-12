<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;
use Gateway\Collections\Gateway\CollectionUser;

if (!defined('ABSPATH')) exit;

/**
 * Core Collection User Route
 *
 * Exposes the active/inactive state of every core adaptor collection so the
 * Raptor settings UI can display and toggle them.  Even when a collection is
 * disabled it no longer appears in the registry — this endpoint sources the
 * complete list directly from Plugin::getCoreCollectionMap(), so disabled
 * collections are always visible and can be re-enabled.
 */
class CoreCollectionUserRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        // List all core collections with their active status
        register_rest_route('gateway/v1', '/core-collections', [
            'methods'             => 'GET',
            'callback'            => [$this, 'getAll'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        // Toggle active flag for a single collection
        register_rest_route('gateway/v1', '/core-collections/(?P<key>[a-z0-9_]+)', [
            'methods'             => 'PATCH',
            'callback'            => [$this, 'update'],
            'permission_callback' => [$this, 'checkPermissions'],
            'args'                => [
                'key'    => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_key',
                ],
                'active' => [
                    'required'          => true,
                    'type'              => 'boolean',
                ],
            ],
        ]);
    }

    /**
     * Return every core collection with its key, display title, and
     * current active flag.
     */
    public function getAll(\WP_REST_Request $request): \WP_REST_Response
    {
        $map  = Plugin::getCoreCollectionMap();
        $list = [];

        foreach ($map as $key => $class) {
            // Instantiate the class just to read its display title — this
            // does not register the collection in the global registry.
            $instance = new $class();
            $list[] = [
                'key'    => $key,
                'title'  => $instance->getTitle(),
                'active' => CollectionUser::isActive($key),
            ];
        }

        return rest_ensure_response(['collections' => $list]);
    }

    /**
     * Update the active flag for one core collection.
     */
    public function update(\WP_REST_Request $request): \WP_REST_Response
    {
        $key    = $request->get_param('key');
        $active = (bool) $request->get_param('active');

        // Validate that the key belongs to a known core collection.
        $map = Plugin::getCoreCollectionMap();
        if (!array_key_exists($key, $map)) {
            return new \WP_Error(
                'not_found',
                sprintf(__('Core collection "%s" not found.', 'gateway'), $key),
                ['status' => 404]
            );
        }

        try {
            $row = CollectionUser::firstOrCreate(
                ['collection_key' => $key],
                ['active' => $active ? 1 : 0]
            );
            $row->active = $active ? 1 : 0;
            $row->save();
        } catch (\Exception $e) {
            return new \WP_Error(
                'update_failed',
                __('Failed to update collection setting.', 'gateway'),
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'success' => true,
            'key'     => $key,
            'active'  => $active,
        ]);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
