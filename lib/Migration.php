<?php

namespace Gateway;

use Gateway\Migrations\MigrationRegistry;

if (!defined('ABSPATH')) exit;

abstract class Migration
{
    protected static string $key   = '';
    protected static string $label = '';
    protected static ?string $version = null;

    abstract public static function create(): void;

    public static function register(): void
    {
        MigrationRegistry::register(static::$key, static::$label, [static::class], static::$version);
    }
}
