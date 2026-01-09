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

        // Install migration to extension
        register_rest_route('gateway/v1', '/migrations/(?P<key>[a-zA-Z0-9_-]+)/install', [
            'methods' => 'POST',
            'callback' => [$this, 'installMigration'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            'args' => [
                'key' => [
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Collection key',
                ],
                'extension' => [
                    'required' => true,
                    'type' => 'string',
                    'description' => 'Extension key',
                ],
            ],
        ]);

        // Get available extensions
        register_rest_route('gateway/v1', '/migrations/extensions/list', [
            'methods' => 'GET',
            'callback' => [$this, 'getAvailableExtensions'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
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

    /**
     * Install migration to extension
     */
    public function installMigration($request)
    {
        $key = $request->get_param('key');
        $extensionKey = $request->get_param('extension');

        $registry = Plugin::getInstance()->getRegistry();
        $extensionRegistry = \Gateway\Extensions\ExtensionRegistry::instance();

        // Get the collection
        try {
            $collection = $registry->get($key);
        } catch (\Exception $e) {
            return new \WP_Error(
                'collection_not_found',
                'Collection not found',
                ['status' => 404]
            );
        }

        // Get the extension
        try {
            $extension = $extensionRegistry->get($extensionKey);
        } catch (\Exception $e) {
            return new \WP_Error(
                'extension_not_found',
                'Extension not found',
                ['status' => 404]
            );
        }

        // Install the migration
        try {
            $result = MigrationGenerator::installToExtension($collection, $extension);

            if (!$result['success']) {
                return new \WP_Error(
                    'migration_install_failed',
                    $result['message'],
                    ['status' => 400, 'result' => $result]
                );
            }

            return $result;
        } catch (\Exception $e) {
            return new \WP_Error(
                'migration_install_error',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get available extensions with standard directory structure
     */
    public function getAvailableExtensions($request)
    {
        try {
            $extensions = MigrationGenerator::getAvailableExtensions();

            // Format extensions for API response
            $formatted = [];
            foreach ($extensions as $key => $extension) {
                $formatted[] = [
                    'key' => $key,
                    'slug' => $extension->getPluginSlug(),
                    'pluginPath' => $extension->getPluginPath(),
                    'databasePath' => $extension->getDatabasePath(),
                ];
            }

            return [
                'success' => true,
                'extensions' => $formatted,
            ];
        } catch (\Exception $e) {
            return new \WP_Error(
                'extensions_fetch_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }
}
