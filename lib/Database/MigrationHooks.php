<?php

namespace Gateway\Database;

use Gateway\Plugin;

if (!defined('ABSPATH')) {
    exit;
}

class MigrationHooks
{

    public static function init()
    {
        add_action('gateway/collection/migrations', [__CLASS__, 'runMigrations'], 10, 2);
    }

    public static function runMigrations($collectionKey = null, $options = [])
    {
        $defaults = [
            'autoGenerate' => false,
            'saveToFile' => false,
        ];

        $options = wp_parse_args($options, $defaults);

        if ($collectionKey) {
            return MigrationRunner::run(
                $collectionKey,
                $options['autoGenerate'],
                $options['saveToFile']
            );
        } else {
            return MigrationRunner::runAll(
                $options['autoGenerate'],
                $options['saveToFile']
            );
        }
    }

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

    public static function runCoreMigrations(): bool
    {
        try {
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
            \Gateway\Raptor\Migrations\RaptorUserLayoutMigration::create();
            \Gateway\Raptor\Migrations\RaptorUserLayoutNodeMigration::create();
            \Gateway\Raptor\Migrations\RaptorPackageMigration::create();
            \Gateway\Raptor\Migrations\RaptorPackageExtensionIdMigration::create();
            \Gateway\Raptor\Migrations\RaptorPackageCollectionMigration::create();
            \Gateway\Raptor\Migrations\RaptorCollectionRelationshipMigration::create();
            \Gateway\Raptor\Migrations\RaptorCollectionPackageKeyMigration::create();
            \Gateway\Raptor\Migrations\RaptorCollectionLabelFieldMigration::create();
            \Gateway\Raptor\Migrations\RaptorExtensionFileMigration::create();
            \Gateway\Raptor\Migrations\RaptorExtensionMigrationTrackingMigration::create();
            return true;
        } catch (\Exception $e) {
            error_log('Gateway: runCoreMigrations failed: ' . $e->getMessage());
            return false;
        }
    }
}
