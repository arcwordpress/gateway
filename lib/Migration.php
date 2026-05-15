<?php

namespace Gateway;

use Gateway\Migrations\MigrationRegistry;

if (!defined('ABSPATH')) exit;

abstract class Migration
{
    protected static string  $extension = '';
    protected static string  $label     = '';
    protected static ?string $version   = null;

    abstract public static function create(): void;

    public static function register(): void
    {
        MigrationRegistry::push(static::$extension, static::$label, static::class, static::$version);
    }

    public static function getExtension(): string  { return static::$extension; }
    public static function getLabel(): string      { return static::$label; }
    public static function getVersion(): ?string   { return static::$version; }
}
