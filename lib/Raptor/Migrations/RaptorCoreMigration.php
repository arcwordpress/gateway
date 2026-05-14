<?php

namespace Gateway\Raptor\Migrations;

use Gateway\Migrations\Migration;

if (!defined('ABSPATH')) exit;

class RaptorCoreMigration extends Migration
{
    protected static string $key   = 'raptor-core';
    protected static string $label = 'Raptor Core';

    protected static array $migrations = [
        RaptorExtensionMigration::class,
        RaptorCollectionMigration::class,
        RaptorFieldListMigration::class,
        RaptorFieldMigration::class,
        RaptorViewListMigration::class,
        RaptorViewMigration::class,
        RaptorFormListMigration::class,
        RaptorFormMigration::class,
        RaptorFormFieldMigration::class,
        RaptorViewRenderMigration::class,
        RaptorFacetListMigration::class,
        RaptorFacetMigration::class,
        RaptorUserLayoutMigration::class,
        RaptorUserLayoutNodeMigration::class,
        RaptorPackageMigration::class,
        RaptorPackageExtensionIdMigration::class,
        RaptorPackageCollectionMigration::class,
        RaptorCollectionRelationshipMigration::class,
        RaptorCollectionPackageKeyMigration::class,
        RaptorCollectionLabelFieldMigration::class,
        RaptorCollectionDisplayFieldMigration::class,
        RaptorExtensionFileMigration::class,
        RaptorExtensionMigrationTrackingMigration::class,
    ];
}
