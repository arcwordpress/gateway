<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) exit;

class MigrationRegistry
{
    /** @var array<string, array{key:string, label:string, migrations:list<array{class:string, label:string}>, version:string|null}> */
    private static array $groups = [];

    /**
     * Bulk-register a group (used internally for gateway-core, raptor-core).
     */
    public static function register(string $key, string $label, array $migrations, ?string $version): void
    {
        $mapped = [];
        foreach ($migrations as $class) {
            $mapped[] = ['class' => $class, 'label' => $class];
        }
        self::$groups[$key] = ['key' => $key, 'label' => $label, 'migrations' => $mapped, 'version' => $version];
    }

    /**
     * Append a single migration class to an extension group.
     * Called by Migration::register().
     */
    public static function push(string $extension, string $migrationLabel, string $class, ?string $version): void
    {
        if (!isset(self::$groups[$extension])) {
            self::$groups[$extension] = [
                'key'        => $extension,
                'label'      => ucwords(str_replace(['-', '_'], ' ', $extension)),
                'migrations' => [],
                'version'    => $version,
            ];
        }

        self::$groups[$extension]['migrations'][] = ['class' => $class, 'label' => $migrationLabel];
    }

    /** @return array<string, array> */
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

    /** @return array{success: bool, ran: int, errors: string[]} */
    public static function runGroup(string $key): array
    {
        $group = self::$groups[$key] ?? null;

        if ($group === null) {
            return ['success' => false, 'ran' => 0, 'errors' => ["Group '{$key}' not found."]];
        }

        $ran    = 0;
        $errors = [];

        foreach ($group['migrations'] as $entry) {
            $class = $entry['class'];
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

        return ['success' => empty($errors), 'ran' => $ran, 'errors' => $errors];
    }

    /** @return array{success: bool, ran: int, errors: string[]} */
    public static function runAll(): array
    {
        $ran    = 0;
        $errors = [];

        foreach (array_keys(self::$groups) as $key) {
            $result  = self::runGroup($key);
            $ran    += $result['ran'];
            $errors  = array_merge($errors, $result['errors']);
        }

        return ['success' => empty($errors), 'ran' => $ran, 'errors' => $errors];
    }
}
