<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) exit;

/**
 * Base class for a registered migration group.
 *
 * Extend this class to group related migration classes under a named key.
 * The settings UI discovers all registered groups from here.
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
 *
 * Registering the same key twice replaces the previous entry.
 */
abstract class Migration
{
    /** Unique slug shown in the UI and used by the run endpoint */
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

    /** @var array<string, array{key:string, label:string, migrations:string[], version:string|null}> */
    private static array $groups = [];

    /**
     * Register this migration group into the shared registry.
     * Replaces any previously registered group with the same key.
     */
    public static function register(): void
    {
        $key = static::$key;

        self::$groups[$key] = [
            'key'        => $key,
            'label'      => static::$label,
            'migrations' => static::$migrations,
            'version'    => static::$version,
        ];
    }

    // ─── Registry accessors ────────────────────────────────────────────────────

    /** @return array<string, array> All registered groups, keyed by slug */
    public static function getAll(): array
    {
        return self::$groups;
    }

    public static function get(string $key): ?array
    {
        return self::$groups[$key] ?? null;
    }

    public static function has(string $key): bool
    {
        return isset(self::$groups[$key]);
    }

    // ─── Runners ───────────────────────────────────────────────────────────────

    /**
     * Run all migration classes in a single registered group.
     *
     * @return array{success: bool, ran: int, errors: string[]}
     */
    public static function runGroup(string $key): array
    {
        $group = self::$groups[$key] ?? null;

        if ($group === null) {
            return ['success' => false, 'ran' => 0, 'errors' => ["Group '{$key}' not found."]];
        }

        $ran    = 0;
        $errors = [];

        foreach ($group['migrations'] as $class) {
            try {
                if (!class_exists($class)) {
                    $errors[] = "Class not found: {$class}";
                    continue;
                }
                $class::create();
                $ran++;
            } catch (\Throwable $e) {
                $errors[] = "{$class}: " . $e->getMessage();
            }
        }

        return [
            'success' => empty($errors),
            'ran'     => $ran,
            'errors'  => $errors,
        ];
    }

    /**
     * Run every registered group in registration order.
     *
     * @return array{success: bool, ran: int, errors: string[]}
     */
    public static function runAll(): array
    {
        $ran    = 0;
        $errors = [];

        foreach (array_keys(self::$groups) as $key) {
            $result  = self::runGroup($key);
            $ran    += $result['ran'];
            $errors  = array_merge($errors, $result['errors']);
        }

        return [
            'success' => empty($errors),
            'ran'     => $ran,
            'errors'  => $errors,
        ];
    }
}
