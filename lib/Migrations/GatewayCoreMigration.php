<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) exit;

class GatewayCoreMigration extends Migration
{
    protected static string $key   = 'gateway-core';
    protected static string $label = 'Gateway Core';

    protected static array $migrations = [
        GatewayBlockTypeUserMigration::class,
        GatewayCollectionUserMigration::class,
        GatewaySettingsMigration::class,
        GatewayMigrationRunMigration::class,
    ];
}
