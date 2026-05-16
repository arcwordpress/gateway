<?php

namespace Gateway\Database;

if (!defined('ABSPATH')) {
    exit;
}

class CoreTablesController
{
    public static function coreTablesExist(): bool
    {
        try {
            $capsule = DatabaseConnection::getCapsule();
            if ($capsule === null) {
                return false;
            }

            $schema = $capsule->getConnection()->getSchemaBuilder();
            if (!$schema || !is_object($schema)) {
                return false;
            }

            return $schema->hasTable('gateway_settings')
                && $schema->hasTable('gateway_raptor_extension')
                && $schema->hasTable('gateway_raptor_package')
                && $schema->hasTable('gateway_migration_run');

        } catch (\Exception $e) {
            return false;
        }
    }
}
