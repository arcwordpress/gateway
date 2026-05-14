<?php

namespace Gateway\Database;

use Gateway\Plugin;
use Gateway\Migrations\Migration;
use Gateway\Migrations\GatewayCoreMigration;
use Gateway\Raptor\Migrations\RaptorCoreMigration;

if (!defined('ABSPATH')) {
    exit;
}

class MigrationHooks
{

    public static function init()
    {
        add_action('gateway/collection/migrations', [__CLASS__, 'runMigrations'], 10, 2);

        GatewayCoreMigration::register();
        RaptorCoreMigration::register();
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
        $result = Migration::runAll();
        if (!$result['success']) {
            foreach ($result['errors'] as $err) {
                error_log('Gateway: runCoreMigrations: ' . $err);
            }
        }
        return $result['success'];
    }
}
