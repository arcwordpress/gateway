<?php

namespace Gateway\Migrations;

use Gateway\Plugin;
use Gateway\Migrations\MigrationGenerator;

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
        register_rest_route('gateway/v1', '/migration-generator/(?P<key>[a-zA-Z0-9_-]+)', [
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

        // Run migration for a specific collection
        register_rest_route('gateway/v1', '/migration-generator/(?P<key>[a-zA-Z0-9_-]+)/run', [
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
            ],
        ]);

        // Install migration to a specific extension
        register_rest_route('gateway/v1', '/migration-generator/(?P<key>[a-zA-Z0-9_-]+)/install', [
            'methods' => 'POST',
            'callback' => [$this, 'installMigrationToExtension'],
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
        register_rest_route('gateway/v1', '/migration-generator/extensions/list', [
            'methods' => 'GET',
            'callback' => [$this, 'getAvailableExtensions'],
            'permission_callback' => function () {
                return current_user_can('manage_options');
            }
        ]);

        // Get migrations for all collections
        register_rest_route('gateway/v1', '/migration-generator', [
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
     * Run migration for a specific collection
     */
    public function runCollectionMigration($request)
    {
        global $wpdb;

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
            // Get table info
            $tableName = $collection->getTable();
            $fullTableName = $wpdb->prefix . $tableName;
            $fillable = $collection->getFillable();
            $casts = $collection->getCasts();
            $fields = $collection->getFields();
            $timestamps = $collection->timestamps;

            // Build columns array
            $columns = [];
            $columns[] = "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY";

            // Process fillable columns
            foreach ($fillable as $column) {
                if ($column === 'id') {
                    continue;
                }

                if ($timestamps && in_array($column, ['created_at', 'updated_at'])) {
                    continue;
                }

                $columnDefinition = $this->getColumnDefinition($column, $fields, $casts);
                $columns[] = $columnDefinition;
            }

            // Add timestamp columns if enabled
            if ($timestamps) {
                $columns[] = "created_at TIMESTAMP NULL DEFAULT NULL";
                $columns[] = "updated_at TIMESTAMP NULL DEFAULT NULL";
            }

            // Add FULLTEXT index for searchable columns
            $searchableColumns = array_values(array_filter(
                $collection->getSearchable(),
                fn($col) => in_array($col, $fillable)
            ));
            if (!empty($searchableColumns)) {
                $columns[] = "FULLTEXT KEY searchable (" . implode(',', $searchableColumns) . ")";
            }

            // Build SQL
            $columnsStr = implode(",\n            ", $columns);
            $charset_collate = $wpdb->get_charset_collate();

            $sql = "CREATE TABLE $fullTableName (
            $columnsStr
        ) $charset_collate;";

            // Run the migration
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql);

            // Check if table was created successfully
            $tableExists = $wpdb->get_var("SHOW TABLES LIKE '$fullTableName'") === $fullTableName;

            if (!$tableExists) {
                throw new \Exception('Table creation failed');
            }

            return [
                'success' => true,
                'message' => "Migration executed successfully for collection '{$collection->getTitle()}'",
                'table' => $fullTableName,
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

    /**
     * Install migration to a specific extension
     */
    public function installMigrationToExtension($request)
    {
        $key = $request->get_param('key');
        $extensionKey = $request->get_param('extension');
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
            $extensions = MigrationGenerator::getAvailableExtensions();

            if (!isset($extensions[$extensionKey])) {
                return new \WP_Error(
                    'extension_not_found',
                    'Extension not found',
                    ['status' => 404]
                );
            }

            $extension = $extensions[$extensionKey];
            $databasePath = $extension->getDatabasePath();
            $filePath = $databasePath . '/' . $migration['className'] . '.php';

            // Ensure directory exists
            if (!file_exists($databasePath)) {
                mkdir($databasePath, 0755, true);
            }

            // Write migration file
            if (file_put_contents($filePath, $migration['code']) === false) {
                throw new \Exception('Failed to write migration file');
            }

            return [
                'success' => true,
                'message' => "Migration installed to {$extension->getPluginSlug()}",
                'filePath' => $filePath,
            ];
        } catch (\Exception $e) {
            return new \WP_Error(
                'migration_install_failed',
                $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get column definition for a field (helper for runCollectionMigration)
     */
    private function getColumnDefinition($column, $fields, $casts)
    {
        $fieldTypeMap = [
            'text' => 'VARCHAR(255)',
            'textarea' => 'TEXT',
            'wysiwyg' => 'LONGTEXT',
            'editor' => 'LONGTEXT',
            'number' => 'BIGINT',
            'email' => 'VARCHAR(255)',
            'url' => 'VARCHAR(512)',
            'tel' => 'VARCHAR(20)',
            'date' => 'DATE',
            'datetime' => 'DATETIME',
            'time' => 'TIME',
            'checkbox' => 'TINYINT(1)',
            'radio' => 'VARCHAR(255)',
            'select' => 'VARCHAR(255)',
            'image' => 'BIGINT UNSIGNED',
            'file' => 'BIGINT UNSIGNED',
            'gallery' => 'TEXT',
            'color' => 'VARCHAR(7)',
            'password' => 'VARCHAR(255)',
        ];

        $castTypeMap = [
            'int' => 'BIGINT',
            'integer' => 'BIGINT',
            'real' => 'DOUBLE',
            'float' => 'DOUBLE',
            'double' => 'DOUBLE',
            'decimal' => 'DECIMAL(10,2)',
            'string' => 'VARCHAR(255)',
            'bool' => 'TINYINT(1)',
            'boolean' => 'TINYINT(1)',
            'object' => 'TEXT',
            'array' => 'TEXT',
            'collection' => 'TEXT',
            'date' => 'DATE',
            'datetime' => 'DATETIME',
            'timestamp' => 'TIMESTAMP',
            'json' => 'LONGTEXT',
        ];

        $type = null;
        $nullable = true;
        $default = null;

        // Try to determine type from fields array
        if (isset($fields[$column])) {
            $field = $fields[$column];
            $fieldType = $field['type'] ?? null;

            if ($fieldType && isset($fieldTypeMap[$fieldType])) {
                $type = $fieldTypeMap[$fieldType];
            }

            if (isset($field['required']) && $field['required']) {
                $nullable = false;
            }

            if (isset($field['default'])) {
                $default = $field['default'];
            }
        }

        // If no type found, try casts array
        if (!$type && isset($casts[$column])) {
            $castType = $casts[$column];
            if (isset($castTypeMap[$castType])) {
                $type = $castTypeMap[$castType];
            } else {
                $type = 'TEXT';
            }
        }

        // Default to VARCHAR if still no type
        if (!$type) {
            $type = 'VARCHAR(255)';
        }

        // Build the column definition
        $definition = "{$column} {$type}";

        if (!$nullable) {
            $definition .= " NOT NULL";
        } else {
            $definition .= " NULL";
        }

        // Add default value if specified
        if ($default !== null) {
            if (is_string($default)) {
                $definition .= " DEFAULT '{$default}'";
            } elseif (is_bool($default)) {
                $definition .= " DEFAULT " . ($default ? '1' : '0');
            } else {
                $definition .= " DEFAULT {$default}";
            }
        }

        return $definition;
    }
}