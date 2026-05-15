<?php

namespace Gateway\Migrations;

use Gateway\Plugin;
use Gateway\Migrations\MigrationRegistry;

if (!defined('ABSPATH')) {
    exit;
}

class MigrationHooks
{

    public static function init()
    {
        add_action('gateway/collection/migrations', [__CLASS__, 'runMigrations'], 10, 2);

        MigrationRegistry::register('gateway-core', 'Gateway Core', [
            \Gateway\Migrations\GatewayBlockTypeUserMigration::class,
            \Gateway\Migrations\GatewayCollectionUserMigration::class,
            \Gateway\Migrations\GatewaySettingsMigration::class,
            \Gateway\Migrations\GatewayMigrationRunMigration::class,
        ], GATEWAY_VERSION);

        MigrationRegistry::register('raptor-core', 'Raptor Core', [
            \Gateway\Raptor\Migrations\RaptorExtensionMigration::class,
            \Gateway\Raptor\Migrations\RaptorCollectionMigration::class,
            \Gateway\Raptor\Migrations\RaptorFieldListMigration::class,
            \Gateway\Raptor\Migrations\RaptorFieldMigration::class,
            \Gateway\Raptor\Migrations\RaptorViewListMigration::class,
            \Gateway\Raptor\Migrations\RaptorViewMigration::class,
            \Gateway\Raptor\Migrations\RaptorFormListMigration::class,
            \Gateway\Raptor\Migrations\RaptorFormMigration::class,
            \Gateway\Raptor\Migrations\RaptorFormFieldMigration::class,
            \Gateway\Raptor\Migrations\RaptorViewRenderMigration::class,
            \Gateway\Raptor\Migrations\RaptorFacetListMigration::class,
            \Gateway\Raptor\Migrations\RaptorFacetMigration::class,
            \Gateway\Raptor\Migrations\RaptorUserLayoutMigration::class,
            \Gateway\Raptor\Migrations\RaptorUserLayoutNodeMigration::class,
            \Gateway\Raptor\Migrations\RaptorPackageMigration::class,
            \Gateway\Raptor\Migrations\RaptorPackageExtensionIdMigration::class,
            \Gateway\Raptor\Migrations\RaptorPackageCollectionMigration::class,
            \Gateway\Raptor\Migrations\RaptorCollectionRelationshipMigration::class,
            \Gateway\Raptor\Migrations\RaptorCollectionPackageKeyMigration::class,
            \Gateway\Raptor\Migrations\RaptorCollectionLabelFieldMigration::class,
            \Gateway\Raptor\Migrations\RaptorCollectionDisplayFieldMigration::class,
            \Gateway\Raptor\Migrations\RaptorExtensionFileMigration::class,
            \Gateway\Raptor\Migrations\RaptorExtensionMigrationTrackingMigration::class,
        ], GATEWAY_VERSION);
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
        $result = MigrationRegistry::runAll();
        if (!$result['success']) {
            foreach ($result['errors'] as $err) {
                error_log('Gateway: runCoreMigrations: ' . $err);
            }
        }
        return $result['success'];
    }
}
