<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) exit;

/**
 * Base class for a registered migration group.
 *
 * Extend this class to group related migration classes under a named key.
 * Calling ::register() adds the group to MigrationRegistry so it appears
 * in the Gateway migrations UI.
 *
 * Usage (call after the `gateway_loaded` action, or at plugin boot):
 *
 *   class ListingMigration extends \Gateway\Migrations\Migration {
 *       protected static string $key        = 'listing';
 *       protected static string $label      = 'Listing';
 *       protected static array  $migrations = [
 *           \Keystone\Migrations\ListingTableMigration::class,
 *           \Keystone\Migrations\ListingMetaMigration::class,
 *       ];
 *   }
 *
 *   ListingMigration::register();
 */
abstract class Migration
{
    /** Unique slug used as the registry key and run-endpoint identifier */
    protected static string $key = '';

    /** Human-readable name shown in the settings UI */
    protected static string $label = '';

    /** Optional version string — set to your plugin's version constant */
    protected static ?string $version = null;

    /**
     * Fully-qualified class names of individual migrations to run, in order.
     * Each class must have a static create() method.
     *
     * @var string[]
     */
    protected static array $migrations = [];

    /**
     * Register this migration group into MigrationRegistry.
     * Replaces any previously registered group with the same key.
     */
    public static function register(): void
    {
        MigrationRegistry::add(static::$key, static::$label, static::$migrations, static::$version);
    }
}
