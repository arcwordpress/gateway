<?php

namespace Gateway\Raptor\Build;

use Gateway\Raptor\Collections\RaptorPackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generates and manages PHP class files for Raptor-managed packages.
 *
 * Each generated class extends \Gateway\Package so the extension's
 * register_packages() can instantiate and register it with WordPress.
 */
class PackageBuilder
{
    /**
     * Write lib/Packages/{ClassName}.php for the given package.
     */
    public function build(RaptorPackage $package, string $pluginDir, string $namespace): array
    {
        $className   = $this->keyToClassName($package->package_key);
        $packagesDir = $pluginDir . '/lib/Packages';

        if (!is_dir($packagesDir) && !wp_mkdir_p($packagesDir)) {
            return ['success' => false, 'package_key' => $package->package_key, 'error' => 'Failed to create Packages directory.'];
        }

        $parent   = $package->parent   ? var_export($package->parent,   true) : 'null';
        $desc     = addslashes($package->description ?? '');
        $label    = addslashes($package->label       ?? '');
        $icon     = addslashes($package->icon        ?? 'dashicons-admin-generic');
        $cap      = addslashes($package->capability  ?? 'manage_options');
        $position = (int) ($package->position ?? 20);
        $key      = addslashes($package->package_key);

        $collectionKeys    = $package->collections()->pluck('collection_key')->toArray();
        $collectionsExport = count($collectionKeys) > 0
            ? "['" . implode("', '", array_map('addslashes', $collectionKeys)) . "']"
            : '[]';

        $code = <<<PHP
<?php

namespace {$namespace}\\Packages;

if (!defined('ABSPATH')) {
    exit;
}

class {$className} extends \\Gateway\\Package
{
    protected \$key         = '{$key}';
    protected \$label       = '{$label}';
    protected \$description = '{$desc}';
    protected \$icon        = '{$icon}';
    protected \$position    = {$position};
    protected \$capability  = '{$cap}';
    protected \$parent      = {$parent};
    protected \$collections = {$collectionsExport};
}
PHP;

        $file = $packagesDir . '/' . $className . '.php';
        if (file_put_contents($file, $code) === false) {
            return ['success' => false, 'package_key' => $package->package_key, 'error' => 'Failed to write package file.'];
        }

        return ['success' => true, 'package_key' => $package->package_key, 'class' => $className, 'file' => $file];
    }

    /**
     * Delete the generated PHP file for a package (called before rename/delete).
     */
    public function delete(RaptorPackage $package, string $pluginSlug): void
    {
        $file = WP_PLUGIN_DIR . '/' . $pluginSlug . '/lib/Packages/' . $this->keyToClassName($package->package_key) . '.php';

        if (file_exists($file)) {
            @unlink($file);
        }
    }

    /**
     * Convert a package_key like "my-package" or "my_package" to "MyPackage".
     */
    public function keyToClassName(string $key): string
    {
        return str_replace(['-', '_', ' '], '', ucwords($key, '-_ '));
    }
}
