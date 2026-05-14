<?php

namespace Gateway\Migrations;

if (!defined('ABSPATH')) exit;

/**
 * Static registry for migration groups.
 *
 * Migration subclasses register themselves here via ::register().
 * SyncRoute and the settings UI read from here.
 */
class MigrationRegistry
{
    /** @var array<string, array{key:string, label:string, migrations:string[], version:string|null}> */
    private static array $groups = [];

    public static function add(string $key, string $label, array $migrations, ?string $version): void
    {
        self::$groups[$key] = compact('key', 'label', 'migrations', 'version');
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
