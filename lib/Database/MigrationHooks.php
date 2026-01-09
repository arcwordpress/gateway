<?php

namespace Gateway\Database;

use Gateway\Plugin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration Hooks
 *
 * Handles action hooks for running database migrations
 */
class MigrationHooks
{
    /**
     * Initialize migration hooks
     */
    public static function init()
    {
        // Register the migration action hook
        add_action('gateway/collection/migrations', [__CLASS__, 'runMigrations'], 10, 2);
    }

    /**
     * Run migrations for one or all collections
     *
     * @param string|null $collectionKey Specific collection key or null for all
     * @param array $options Options for running migrations
     *                       - autoGenerate: bool (default false) - Whether to auto-generate missing migrations
     *                       - saveToFile: bool (default false) - Whether to save generated migrations to file
     * @return array|null Results array or null
     */
    public static function runMigrations($collectionKey = null, $options = [])
    {
        $defaults = [
            'autoGenerate' => false,
            'saveToFile' => false,
        ];

        $options = wp_parse_args($options, $defaults);

        if ($collectionKey) {
            // Run migration for specific collection
            return MigrationRunner::run(
                $collectionKey,
                $options['autoGenerate'],
                $options['saveToFile']
            );
        } else {
            // Run migrations for all collections
            return MigrationRunner::runAll(
                $options['autoGenerate'],
                $options['saveToFile']
            );
        }
    }

    /**
     * Run migration for a specific collection (convenience method)
     *
     * @param string $collectionKey
     * @param bool $autoGenerate
     * @param bool $saveToFile
     * @return array
     */
    public static function runMigration($collectionKey, $autoGenerate = false, $saveToFile = false)
    {
        return do_action_ref_array('gateway/collection/migrations', [
            $collectionKey,
            [
                'autoGenerate' => $autoGenerate,
                'saveToFile' => $saveToFile,
            ]
        ]);
    }

    /**
     * Run migrations for all collections (convenience method)
     *
     * @param bool $autoGenerate
     * @param bool $saveToFile
     * @return array
     */
    public static function runAllMigrations($autoGenerate = false, $saveToFile = false)
    {
        return do_action_ref_array('gateway/collection/migrations', [
            null,
            [
                'autoGenerate' => $autoGenerate,
                'saveToFile' => $saveToFile,
            ]
        ]);
    }

    /**
     * Run core migrations (called during plugin activation)
     *
     * @return void
     */
    public static function runCoreMigrations()
    {
        // Run migration for gateway_project (core collection)
        do_action('gateway/collection/migrations', 'gateway_project', [
            'autoGenerate' => false,
            'saveToFile' => false,
        ]);
    }
}
