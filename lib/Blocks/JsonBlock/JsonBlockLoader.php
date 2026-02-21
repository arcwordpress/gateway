<?php

namespace Gateway\Blocks\JsonBlock;

/**
 * Loads and stores JSON block definitions.
 *
 * Definitions come from two sources — filesystem and database — and are
 * merged at load time. Database definitions override filesystem ones with
 * the same block name, so stored/dynamic definitions always win.
 *
 * Filesystem: *.json files in the configured directory (static, read-only).
 * Database:   WP option 'gateway_json_blocks' (CRUD via JsonBlockRoutes).
 */
class JsonBlockLoader
{
    /** @var array<string, array> In-memory definitions keyed by block name */
    private static array $definitions = [];

    /** Filesystem directory scanned for *.json block definitions */
    private static string $directory = '';

    /**
     * Set the filesystem directory to scan for JSON block definitions.
     * Called once during plugin init (JsonBlockRegistrar::init).
     */
    public static function setDirectory(string $path): void
    {
        self::$directory = rtrim($path, '/');
    }

    /**
     * Load all definitions: filesystem first, then database.
     * Database definitions with the same name override filesystem ones.
     */
    public static function load(): void
    {
        self::loadFromDirectory();
        self::loadFromDatabase();
    }

    /**
     * Scan the configured directory for *.json block definition files.
     */
    public static function loadFromDirectory(): void
    {
        if (!self::$directory || !is_dir(self::$directory)) {
            return;
        }

        $files = glob(self::$directory . '/*.json') ?: [];

        foreach ($files as $file) {
            $raw = file_get_contents($file);
            if ($raw === false) {
                continue;
            }

            $definition = json_decode($raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('Gateway JsonBlock: invalid JSON in ' . $file . ': ' . json_last_error_msg());
                continue;
            }

            if (!self::isValid($definition)) {
                error_log('Gateway JsonBlock: missing required fields (name, title) in ' . $file);
                continue;
            }

            self::$definitions[$definition['name']] = $definition;
        }
    }

    /**
     * Load definitions stored in the WordPress options table.
     */
    public static function loadFromDatabase(): void
    {
        $stored = get_option('gateway_json_blocks', []);
        if (!is_array($stored)) {
            return;
        }

        foreach ($stored as $name => $definition) {
            self::$definitions[$name] = $definition;
        }
    }

    /**
     * Programmatically register a definition from PHP (in-memory only, not persisted).
     */
    public static function define(array $definition): void
    {
        if (!self::isValid($definition)) {
            return;
        }
        self::$definitions[$definition['name']] = $definition;
    }

    /**
     * Persist a definition to the database (creates or updates).
     */
    public static function save(array $definition): bool
    {
        if (!self::isValid($definition)) {
            return false;
        }

        $stored = get_option('gateway_json_blocks', []);
        $stored[$definition['name']] = $definition;

        self::$definitions[$definition['name']] = $definition;

        return (bool) update_option('gateway_json_blocks', $stored);
    }

    /**
     * Remove a definition from the database by block name.
     */
    public static function delete(string $name): bool
    {
        $stored = get_option('gateway_json_blocks', []);
        if (!isset($stored[$name])) {
            return false;
        }

        unset($stored[$name], self::$definitions[$name]);

        return (bool) update_option('gateway_json_blocks', $stored);
    }

    /**
     * Return all currently loaded definitions.
     *
     * @return array<string, array>
     */
    public static function getAll(): array
    {
        return self::$definitions;
    }

    /**
     * Return a single definition by block name, or null if not found.
     */
    public static function get(string $name): ?array
    {
        return self::$definitions[$name] ?? null;
    }

    /**
     * Convert a definition to the shape expected by window.gatewayBlocks.
     * Must match the format produced by Block::getMetadata().
     */
    public static function toEditorMeta(array $definition): array
    {
        $hasInnerBlocks = isset($definition['template'])
            && str_contains($definition['template'], '<InnerBlocks');

        return [
            'name'          => $definition['name'],
            'title'         => $definition['title'],
            'category'      => $definition['category'] ?? 'gateway',
            'hasInnerBlocks' => $hasInnerBlocks,
            'fields'        => array_values($definition['fields'] ?? []),
        ];
    }

    /**
     * Validate that a definition has the required fields.
     * Block name must follow the WordPress namespace/block-name convention.
     */
    public static function isValid(array $definition): bool
    {
        return !empty($definition['name'])
            && !empty($definition['title'])
            && (bool) preg_match('/^[a-z0-9-]+\/[a-z0-9-]+$/', $definition['name']);
    }
}
