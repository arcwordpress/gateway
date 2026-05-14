<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) exit;

/**
 * MigrationRegistry
 *
 * A lightweight static registry for migration groups. Any plugin or extension
 * can register its migration classes here; the settings UI and run-all flow
 * consult this registry instead of scanning files or relying solely on the
 * gateway_raptor_extension DB table.
 *
 * Usage (call after the `gateway_loaded` action):
 *
 *   MigrationRegistry::register('my-extension', 'My Extension', [
 *       \MyPlugin\Migrations\PostsMigration::class,
 *       \MyPlugin\Migrations\MetaMigration::class,
 *   ]);
 *
 * Groups are keyed by an arbitrary slug. Registering the same key twice
 * replaces the previous entry so plugins can update their list on rebuild.
 */
class MigrationRegistry
{
    /** @var array<string, array{key:string, label:string, migrations:string[], version:string|null}> */
    private static array $groups = [];

    /**
     * Register a named group of migration classes.
     *
     * @param string      $key        Unique slug (e.g. 'gateway-core', 'my-extension')
     * @param string      $label      Human-readable name shown in the settings UI
     * @param string[]    $migrations Fully-qualified class names, each with a static create() method
     * @param string|null $version    Optional version string for display purposes
     */
    public static function register(string $key, string $label, array $migrations, ?string $version = null): void
    {
        self::$groups[$key] = [
            'key'        => $key,
            'label'      => $label,
            'migrations' => $migrations,
            'version'    => $version,
        ];
    }

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

    /**
     * Run all migration classes in a single group.
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
