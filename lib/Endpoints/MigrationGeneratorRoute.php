<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;
use Gateway\Database\MigrationGenerator;

if (!defined('ABSPATH')) exit;

/**
 * Migration Generator Route
 *
 * Provides API endpoint for generating database migrations
 */
class MigrationGeneratorRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoute']);
    }

    public function registerRoute()
    {
        // Get migration for a specific collection
        register_rest_route('gateway/v1', '/migrations/(?P<key>[a-zA-Z0-9_-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getCollectionMigration'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            'args' => [
                'key' => [
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Collection key',
                ],
            ],
        ]);

        // Get migrations for all collections
        register_rest_route('gateway/v1', '/migrations', [
            'methods' => 'GET',
            'callback' => [$this, 'getAllMigrations'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);
    }

    /**
     * Get migration for a specific collection
     */
    public function getCollectionMigration($request)
    {
        $key = $request->get_param('key');
        $registry = Plugin::getInstance()->getRegistry();

        $collection = $registry->get($key);

        if (!$collection) {
            return new \WP_Error(
                'collection_not_found',
                'Collection not found',
                ['status' => 404]
            );
        }

        try {
            $migration = MigrationGenerator::generate($collection);

            return [
                'success' => true,
                'migration' => $migration,
            ];
        } catch (\Exception $e) {
            return new \WP_Error(
                'migration_generation_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get migrations for all collections
     */
    public function getAllMigrations($request)
    {
        try {
            $migrations = MigrationGenerator::generateAll();

            return [
                'success' => true,
                'migrations' => $migrations,
            ];
        } catch (\Exception $e) {
            return new \WP_Error(
                'migration_generation_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }
}
