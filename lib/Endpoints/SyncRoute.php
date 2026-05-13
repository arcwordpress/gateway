<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;
use Gateway\Database\MigrationHooks;

if (!defined('ABSPATH')) exit;

/**
 * REST endpoints for UI-triggered sync operations.
 *
 * These replace automatic code that previously ran on every request.
 * Gateway knows what is registered at runtime, so the UI can show status
 * and let the user decide when to sync.
 *
 * Endpoints:
 *   GET  /gateway/v1/sync/status          — what is registered vs. what is in the DB
 *   POST /gateway/v1/sync/collections     — seed core collection toggle rows
 *   POST /gateway/v1/sync/block-types     — seed block-type toggle rows
 *   POST /gateway/v1/sync/core-migrations — run Gateway core DB migrations
 */
class SyncRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/sync/status', [
            'methods'             => 'GET',
            'callback'            => [$this, 'getStatus'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/sync/collections', [
            'methods'             => 'POST',
            'callback'            => [$this, 'syncCollections'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/sync/block-types', [
            'methods'             => 'POST',
            'callback'            => [$this, 'syncBlockTypes'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/sync/core-migrations', [
            'methods'             => 'POST',
            'callback'            => [$this, 'runCoreMigrations'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);
    }

    /**
     * GET /sync/status
     *
     * Returns what Gateway currently knows about at runtime vs. what the DB
     * contains, so the UI can surface any gaps and offer action buttons.
     */
    public function getStatus(\WP_REST_Request $request): \WP_REST_Response
    {
        $plugin = Plugin::getInstance();

        // Registered collections (those actually wired up with REST routes)
        $registeredCollections = array_keys($plugin->getRegistry()->getAll());

        // Core collection map (all WP core collections Gateway knows about)
        $coreMap = Plugin::getCoreCollectionMap();

        // Collection toggle rows that exist in the DB
        $seededCollections = [];
        try {
            $seededCollections = \Gateway\Collections\Gateway\CollectionUser::pluck('collection_key')->toArray();
        } catch (\Throwable $e) {
            // Table may not exist yet
        }

        // Block types currently registered in the plugin
        $registeredBlockTypes = [];
        try {
            $gutenbergDir = GATEWAY_PATH . 'react/block-types/build/blocks';
            if (is_dir($gutenbergDir)) {
                foreach (glob($gutenbergDir . '/*/block.json') ?: [] as $jsonPath) {
                    $meta = json_decode(file_get_contents($jsonPath), true);
                    if (!empty($meta['name'])) {
                        $registeredBlockTypes[] = $meta['name'];
                    }
                }
            }
            foreach (\Gateway\Blocks\BlockRegistry::instance()->getAll() as $block) {
                $registeredBlockTypes[] = $block::getName();
            }
            foreach (\Gateway\Blocks\JsonBlock\JsonBlockLoader::getAll() as $def) {
                if (!empty($def['name'])) {
                    $registeredBlockTypes[] = $def['name'];
                }
            }
        } catch (\Throwable $e) {
            // Non-fatal
        }

        // Block type toggle rows that exist in the DB
        $seededBlockTypes = [];
        try {
            $seededBlockTypes = \Gateway\Collections\Gateway\BlockTypeUser::pluck('slug')->toArray();
        } catch (\Throwable $e) {
            // Table may not exist yet
        }

        $unseededCollections  = array_values(array_diff(array_keys($coreMap), $seededCollections));
        $unseededBlockTypes   = array_values(array_diff($registeredBlockTypes, $seededBlockTypes));

        return new \WP_REST_Response([
            'success'               => true,
            'collections'           => [
                'registered'        => $registeredCollections,
                'core_known'        => array_keys($coreMap),
                'seeded'            => $seededCollections,
                'unseeded'          => $unseededCollections,
                'needs_sync'        => !empty($unseededCollections),
            ],
            'block_types'           => [
                'registered'        => array_values(array_unique($registeredBlockTypes)),
                'seeded'            => $seededBlockTypes,
                'unseeded'          => $unseededBlockTypes,
                'needs_sync'        => !empty($unseededBlockTypes),
            ],
        ], 200);
    }

    /**
     * POST /sync/collections
     *
     * Creates a toggle row for each known core collection if one does not exist.
     * Safe to call multiple times — uses firstOrCreate internally.
     */
    public function syncCollections(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            Plugin::getInstance()->seedCollections();
            return new \WP_REST_Response(['success' => true, 'message' => 'Core collections synced.'], 200);
        } catch (\Throwable $e) {
            return new \WP_REST_Response(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /sync/block-types
     *
     * Creates a toggle row for each currently-registered block type if one does
     * not exist. Safe to call multiple times — uses firstOrCreate internally.
     */
    public function syncBlockTypes(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            Plugin::getInstance()->seedBlockTypes();
            return new \WP_REST_Response(['success' => true, 'message' => 'Block types synced.'], 200);
        } catch (\Throwable $e) {
            return new \WP_REST_Response(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /sync/core-migrations
     *
     * Runs Gateway's core DB migrations (creates/updates internal tables).
     * Same as what runs on plugin activation.
     */
    public function runCoreMigrations(\WP_REST_Request $request): \WP_REST_Response
    {
        try {
            $success = MigrationHooks::runCoreMigrations();
            if ($success) {
                update_option('gateway_tables_schema', GATEWAY_VERSION, false);
                return new \WP_REST_Response(['success' => true, 'message' => 'Core migrations ran successfully.'], 200);
            }
            return new \WP_REST_Response(['success' => false, 'message' => 'Migrations ran but reported failure.'], 500);
        } catch (\Throwable $e) {
            return new \WP_REST_Response(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
