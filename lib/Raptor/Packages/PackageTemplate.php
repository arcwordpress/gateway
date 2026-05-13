<?php

namespace Gateway\Raptor\Packages;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generates a standalone PHP class stub from a Raptor package record.
 *
 * Use this to "export" a DB-managed package to code so it can live in a
 * theme or custom plugin without requiring Raptor at runtime.
 */
class PackageTemplate
{
    /**
     * @param array $record  Associative array matching gateway_raptor_package columns.
     * @return string        Ready-to-save PHP source.
     */
    public static function render(array $record): string
    {
        $key         = $record['package_key']  ?? '';
        $label       = addslashes($record['label']       ?? '');
        $description = addslashes($record['description'] ?? '');
        $icon        = addslashes($record['icon']        ?? 'dashicons-admin-generic');
        $position    = (int) ($record['position']   ?? 20);
        $capability  = addslashes($record['capability']  ?? 'manage_options');
        $parent      = $record['parent'] ? "'" . addslashes($record['parent']) . "'" : 'null';

        $className = self::keyToClassName($key);

        return <<<PHP
<?php

/**
 * Package: {$label}
 *
 * Auto-generated from Raptor. You may customise this class freely.
 * Register it by calling: (new {$className}())->register();
 */
class {$className} extends \\Gateway\\Package\\Package
{
    protected \$key         = '{$key}';
    protected \$label       = '{$label}';
    protected \$description = '{$description}';
    protected \$icon        = '{$icon}';
    protected \$position    = {$position};
    protected \$capability  = '{$capability}';
    protected \$parent      = {$parent};
}
PHP;
    }

    private static function keyToClassName(string $key): string
    {
        return str_replace(['-', '_', ' '], '', ucwords($key, '-_ ')) . 'Package';
    }
}
