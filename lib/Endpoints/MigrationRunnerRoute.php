<?php

namespace Gateway\Endpoints;

use Gateway\Plugin;
use Gateway\Database\MigrationRunner;

if (!defined('ABSPATH')) exit;

/**
 * Migration Runner Route
 *
 * Provides API endpoint for running database migrations
 */
class MigrationRunnerRoute
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoute']);
    }

    public function registerRoute()
    {
        // Run migration for a specific collection
        register_rest_route('gateway/v1', '/collection/migration/(?P<key>[a-zA-Z0-9_-]+)', [
            'methods' => 'POST',
            'callback' => [$this, 'runCollectionMigration'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            'args' => [
                'key' => [
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Collection key',
                ],
                'autoGenerate' => [
                    'required' => false,
                    'type' => 'boolean',
                    'default' => false,
                    'description' => 'Auto-generate migration if it does not exist',
                ],
                'saveToFile' => [
                    'required' => false,
                    'type' => 'boolean',
                    'default' => false,
                    'description' => 'Save generated migration to file',
                ],
            ],
        ]);

        // Run migrations for all collections
        register_rest_route('gateway/v1', '/collection/migration', [
            'methods' => 'POST',
            'callback' => [$this, 'runAllMigrations'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            'args' => [
                'autoGenerate' => [
                    'required' => false,
                    'type' => 'boolean',
                    'default' => false,
                    'description' => 'Auto-generate migrations if they do not exist',
                ],
                'saveToFile' => [
                    'required' => false,
                    'type' => 'boolean',
                    'default' => false,
                    'description' => 'Save generated migrations to file',
                ],
            ],
        ]);

        // Check migration status for a collection
        register_rest_route('gateway/v1', '/collection/migration/(?P<key>[a-zA-Z0-9_-]+)/status', [
            'methods' => 'GET',
            'callback' => [$this, 'getMigrationStatus'],
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
    }

    /**
     * Run migration for a specific collection
     */
    public function runCollectionMigration($request)
    {
        $key = $request->get_param('key');
        $autoGenerate = $request->get_param('autoGenerate') ?? false;
        $saveToFile = $request->get_param('saveToFile') ?? false;

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
            $result = MigrationRunner::run($key, $autoGenerate, $saveToFile);

            if ($result['success']) {
                return [
                    'success' => true,
                    'message' => $result['message'],
                    'generated' => $result['generated'],
                    'filePath' => $result['filePath'],
                    'collection' => [
                        'key' => $key,
                        'title' => $collection->getTitle(),
                        'table' => $collection->getTable(),
                    ],
                ];
            } else {
                return new \WP_Error(
                    'migration_failed',
                    $result['message'],
                    ['status' => 500]
                );
            }
        } catch (\Exception $e) {
            return new \WP_Error(
                'migration_execution_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Run migrations for all collections
     */
    public function runAllMigrations($request)
    {
        $autoGenerate = $request->get_param('autoGenerate') ?? false;
        $saveToFile = $request->get_param('saveToFile') ?? false;

        try {
            $results = MigrationRunner::runAll($autoGenerate, $saveToFile);

            $successCount = 0;
            $failureCount = 0;
            $details = [];

            foreach ($results as $key => $result) {
                if ($result['success']) {
                    $successCount++;
                } else {
                    $failureCount++;
                }

                $details[] = [
                    'key' => $key,
                    'success' => $result['success'],
                    'message' => $result['message'],
                    'generated' => $result['generated'],
                    'filePath' => $result['filePath'],
                ];
            }

            return [
                'success' => $failureCount === 0,
                'message' => "Ran migrations for " . count($results) . " collection(s). Success: {$successCount}, Failed: {$failureCount}",
                'successCount' => $successCount,
                'failureCount' => $failureCount,
                'details' => $details,
            ];
        } catch (\Exception $e) {
            return new \WP_Error(
                'migration_execution_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get migration status for a collection
     */
    public function getMigrationStatus($request)
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
            $migrationExists = MigrationRunner::exists($key);
            $tableExists = MigrationRunner::tableExists($key);

            return [
                'success' => true,
                'collection' => [
                    'key' => $key,
                    'title' => $collection->getTitle(),
                    'table' => $collection->getTable(),
                ],
                'migrationExists' => $migrationExists,
                'tableExists' => $tableExists,
                'needsMigration' => !$tableExists,
                'canRun' => $migrationExists || true, // Can always run with autoGenerate
            ];
        } catch (\Exception $e) {
            return new \WP_Error(
                'status_check_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }
}
