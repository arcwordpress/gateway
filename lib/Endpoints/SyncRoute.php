<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;
use Gateway\Migrations\MigrationHooks;

if (!defined('ABSPATH')) exit;

/**
 * REST endpoints for UI-triggered sync operations.
 *
 * These replace automatic code that previously ran on every request.
 * Gateway knows what is registered at runtime, so the UI can show status
 * and let the user decide when to sync.
 *
 * Endpoints:
 *   GET  /gateway/v1/sync/status          — registered collections at runtime
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

        register_rest_route('gateway/v1', '/sync/core-migrations', [
            'methods'             => 'POST',
            'callback'            => [$this, 'runCoreMigrations'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

        register_rest_route('gateway/v1', '/sync/extension/(?P<key>[a-zA-Z0-9_\-]+)/migrations', [
            'methods'             => 'GET, POST',
            'callback'            => [$this, 'extensionMigrations'],
            'permission_callback' => [$this, 'checkPermissions'],
        ]);

    }

    /**
     * GET /sync/status
     *
     * Returns collections registered at runtime.
     */
    public function getStatus(\WP_REST_Request $request): \WP_REST_Response
    {
        $registeredCollections = array_keys(Plugin::getInstance()->getRegistry()->getAll());

        return new \WP_REST_Response([
            'success'     => true,
            'collections' => [
                'registered' => $registeredCollections,
            ],
        ], 200);
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

    /**
     * GET  /sync/extension/{key}/migrations — check if migrations are due
     * POST /sync/extension/{key}/migrations — run them if due (version changed)
     *
     * "Due" means extension.version !== extension.migration_version, matching
     * the same tracking the builder sets after a successful build.
     */
    public function extensionMigrations(\WP_REST_Request $request): \WP_REST_Response
    {
        $key       = $request->get_param('key');
        $extension = \Gateway\Raptor\Collections\RaptorExtension::where('extension_key', $key)->first();

        if (!$extension) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Extension not found.'], 404);
        }

        $due = $extension->version !== $extension->migration_version;

        if ($request->get_method() === 'GET') {
            return new \WP_REST_Response([
                'success'           => true,
                'extension_key'     => $key,
                'current_version'   => $extension->version,
                'migration_version' => $extension->migration_version,
                'migrations_ran_at' => $extension->migrations_ran_at,
                'due'               => $due,
            ], 200);
        }

        // POST — always run regardless of due status (supports force re-run from UI).
        try {
            $result = (new \Gateway\Raptor\Build\RaptorBuilder())->build($key);
            return new \WP_REST_Response([
                'success' => $result['success'] ?? false,
                'message' => $result['success'] ? 'Migrations ran successfully.' : 'Build failed.',
                'due'     => $due,
                'build'   => $result,
            ], $result['success'] ? 200 : 500);
        } catch (\Throwable $e) {
            return new \WP_REST_Response(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
