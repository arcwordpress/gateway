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
     * Creates internal Gateway tables that must exist before any request
     * attempts to read block-type or collection active/inactive state.
     *
     * @return void
     */
    public static function runCoreMigrations()
    {
        \Gateway\Migrations\GatewayBlockTypeUserMigration::create();
        \Gateway\Migrations\GatewayCollectionUserMigration::create();
        \Gateway\Migrations\GatewaySettingsMigration::create();
        \Gateway\Raptor\Migrations\RaptorExtensionMigration::create();
        \Gateway\Raptor\Migrations\RaptorCollectionMigration::create();
        \Gateway\Raptor\Migrations\RaptorFieldListMigration::create();
        \Gateway\Raptor\Migrations\RaptorFieldMigration::create();
        \Gateway\Raptor\Migrations\RaptorViewListMigration::create();
        \Gateway\Raptor\Migrations\RaptorViewMigration::create();
        \Gateway\Raptor\Migrations\RaptorFormListMigration::create();
        \Gateway\Raptor\Migrations\RaptorFormMigration::create();
        \Gateway\Raptor\Migrations\RaptorFormFieldMigration::create();
        \Gateway\Raptor\Migrations\RaptorViewRenderMigration::create();
        \Gateway\Raptor\Migrations\RaptorFacetListMigration::create();
        \Gateway\Raptor\Migrations\RaptorFacetMigration::create();

        // Migrate existing WordPress options to the settings collection
        \Gateway\Migrations\GatewaySettingsMigration::migrateFromOptions(false);
    }
}
