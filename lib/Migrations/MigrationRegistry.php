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
        self::$groups[$key] = compact('key', 'label', 'migrations', 'version');
    }

    /**
     * Append a single migration class to an extension group.
     * Called by Migration::register().
     */
    public static function push(string $extension, string $class, ?string $version): void
    {
        // Fall back to the convention constant (e.g. WAYPOINT_VERSION) when version is not provided.
        if ($version === null) {
            $constant = strtoupper(str_replace(['-', ' '], '_', $extension)) . '_VERSION';
            if (defined($constant)) {
                $resolved = constant($constant);
                // Accept only scalar strings that look like a version (e.g. "1.2.3", "2.0.0-beta")
                if (is_string($resolved) && preg_match('/^\d+\.\d+/', $resolved)) {
                    $version = $resolved;
                }
            }
        }

        if (!isset(self::$groups[$extension])) {
            self::$groups[$extension] = [
                'key'        => $extension,
                'label'      => ucwords(str_replace(['-', '_'], ' ', $extension)),
                'migrations' => [],
                'version'    => $version,
            ];
        } else {
            // Always reflect the plugin version — bumping it invalidates the whole group
            self::$groups[$extension]['version'] = $version;
        }

        self::$groups[$extension]['migrations'][] = $class;
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
