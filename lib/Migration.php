<?php

namespace Gateway;

use Gateway\Migrations\MigrationRegistry;

if (!defined('ABSPATH')) exit;

abstract class Migration
{
    protected static string  $extension = '';
    /** Plugin version — bump to mark all migrations in this extension as due */
    protected static ?string $version   = null;

    abstract public static function create(): void;

    public static function register(): void
    {
        MigrationRegistry::push(static::$extension, static::class, static::$version);
    }

    public static function getExtension(): string { return static::$extension; }
    public static function getVersion(): ?string  { return static::$version; }
}
