<?php

namespace Gateway\Raptor\Build;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Collections\RaptorExtensionFile;
use Gateway\Raptor\Collections\RaptorPackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Builds a WordPress plugin from Raptor extension + collection + field data.
 *
 * The builder reads entirely from the database (RaptorExtension →
 * RaptorCollection → RaptorFieldList → RaptorField) and then calls the
 * existing shared generators to write plugin files to WP_PLUGIN_DIR.
 *
 * Naming conventions mirror Exta's:
 *   extension_key "my_ext" → plugin slug "my-ext"
 *                          → PHP namespace "MyExt"
 *                          → constant prefix "MY_EXT"
 */
class RaptorBuilder
{
    /**
     * Full build: generate/refresh all plugin files for the given extension.
     *
     * @param  string $extensionKey
     * @return array  Structured result for the API response.
     */
    public function build(string $extensionKey): array
    {
        $extension = RaptorExtension::where('extension_key', $extensionKey)->first();
        if (!$extension) {
            return ['success' => false, 'error' => "Extension '{$extensionKey}' not found."];
        }

        $pluginSlug     = $this->toPluginSlug($extensionKey);
        $namespace      = !empty($extension->namespace)
                            ? $extension->namespace
                            : $this->toNamespace($extensionKey);
        $constantPrefix = strtoupper($extensionKey);
        $projectName    = $extension->title ?: ucwords(str_replace('_', ' ', $extensionKey));
        $pluginDir      = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $pluginFile     = $pluginSlug . '/' . $pluginSlug . '.php';

        if (!function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $wasActive = is_plugin_active($pluginFile);

        $scaffoldResult = $this->scaffoldPlugin(
            $pluginDir, $pluginSlug, $namespace, $constantPrefix, $projectName, $extension
        );

        $packages = $extension->packages()->where('status', 'active')->get();

        $packagesDir = $pluginDir . '/lib/Packages';
        if (is_dir($packagesDir)) {
            $activeFiles = $packages->map(fn($p) => $this->packageKeyToClassName($p->package_key) . '.php')->toArray();
            foreach (glob($packagesDir . '/*.php') ?: [] as $file) {
                if (!in_array(basename($file), $activeFiles, true)) {
                    @unlink($file);
                }
            }
        }

        $packageResults = [];
        foreach ($packages as $package) {
            $packageResults[] = $this->buildPackage($package, $pluginDir, $namespace);
        }

        $collections = RaptorCollection::where('extension_id', $extension->id)
            ->with(['fieldList.fields'])
            ->orderBy('id')
            ->get();

        $collectionResults = [];
        foreach ($collections as $collection) {
            $collectionResults[] = $this->buildCollection($collection, $pluginSlug, $namespace);
        }

        // Only activate when the plugin wasn't already active (first build or was deactivated).
        // For active plugins, files were just overwritten in place — no re-activation needed.
        $activationResult = $wasActive
            ? ['activated' => false, 'already_active' => true]
            : $this->activatePlugin($pluginSlug);

        // Record that migrations have been run for the current version.
        $extension->update([
            'migration_version' => $extension->version,
            'migrations_ran_at' => current_time('mysql', true), // UTC
        ]);

        return [
            'success'             => true,
            'plugin_slug'         => $pluginSlug,
            'plugin_dir'          => $pluginDir,
            'namespace'           => $namespace,
            'scaffold'            => $scaffoldResult,
            'packages'            => $packageResults,
            'package_count'       => count($packageResults),
            'collections'         => $collectionResults,
            'collection_count'    => count($collectionResults),
            'activation'          => $activationResult,
            'migration_version'   => $extension->version,
            'migrations_ran_at'   => $extension->migrations_ran_at,
        ];
    }

    /**
     * Activate the generated plugin in WordPress so its collections register on next load.
     */
    public function activatePlugin(string $pluginSlug): array
    {
        $pluginFile = $pluginSlug . '/' . $pluginSlug . '.php';

        if (!function_exists('activate_plugin')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        if (is_plugin_active($pluginFile)) {
            return ['activated' => false, 'already_active' => true];
        }

        $result = activate_plugin($pluginFile);

        if (is_wp_error($result)) {
            return ['activated' => false, 'error' => $result->get_error_message()];
        }

        return ['activated' => true];
    }

    /**
     * Scaffold the plugin directory and main plugin file.
     * Already-existing files are skipped so repeated builds are safe.
     */
    public function scaffoldPlugin(
        string $pluginDir,
        string $pluginSlug,
        string $namespace,
        string $constantPrefix,
        string $projectName,
        RaptorExtension $extension
    ): array {
        // Create directory structure
        foreach (['lib/Packages', 'lib/Collections', 'lib/Views', 'schemas'] as $subDir) {
            if (!is_dir($pluginDir . '/' . $subDir)) {
                if (!wp_mkdir_p($pluginDir . '/' . $subDir)) {
                    return ['success' => false, 'error' => "Failed to create plugin directory: {$subDir}"];
                }
            }
        }

        $pluginFile = $pluginDir . '/' . $pluginSlug . '.php';

        $templatePath = GATEWAY_PATH . 'templates/scaffold/plugin_main.php';
        if (!file_exists($templatePath)) {
            return ['success' => false, 'error' => 'Plugin template not found.'];
        }

        $template = file_get_contents($templatePath);

        $replacements = [
            '{{PROJECT_NAME}}'     => $projectName,
            '{{PROJECT_SLUG}}'     => $pluginSlug,
            '{{NAMESPACE}}'        => $namespace,
            '{{CONSTANT_PREFIX}}' => $constantPrefix,
        ];

        $code = str_replace(array_keys($replacements), array_values($replacements), $template);

        if (file_put_contents($pluginFile, $code) === false) {
            return ['success' => false, 'error' => 'Failed to write main plugin file.'];
        }

        $extensionResult = $this->buildExtensionFile($pluginDir, $namespace, $extension);
        if (!$extensionResult['success']) {
            return $extensionResult;
        }

        return ['success' => true, 'skipped' => false, 'plugin_file' => $pluginFile];
    }

    /**
     * Find-or-create the RaptorExtensionFile record, then write lib/Extension.php
     * Accessible publicly so callers (e.g. REST endpoints) can run a targeted repair.
     *
     * @public
     * for the extension — a thin subclass of \Gateway\Extension that registers
     * the plugin with Gateway's ExtensionRegistry.
     */
    public function buildExtensionFile(string $pluginDir, string $namespace, RaptorExtension $extension): array
    {
        try {
            RaptorExtensionFile::firstOrCreate(['extension_id' => $extension->id]);
        } catch (\Throwable $e) {
            // Table may not exist yet — non-fatal, file write proceeds.
        }

        $libDir = $pluginDir . '/lib';

        if (!is_dir($libDir) && !wp_mkdir_p($libDir)) {
            return ['success' => false, 'error' => 'Failed to create lib directory.'];
        }

        $templatePath = GATEWAY_PATH . 'templates/scaffold/extension_class.php';
        if (!file_exists($templatePath)) {
            return ['success' => false, 'error' => 'Extension class template not found.'];
        }

        $replacements = [
            '{{NAMESPACE}}' => $namespace,
            '{{KEY}}'       => addslashes($extension->extension_key),
            '{{TITLE}}'     => addslashes($extension->title),
        ];
        $code = str_replace(array_keys($replacements), array_values($replacements), file_get_contents($templatePath));
        $file = $libDir . '/Extension.php';

        if (file_put_contents($file, $code) === false) {
            return ['success' => false, 'error' => 'Failed to write Extension.php.'];
        }

        return ['success' => true, 'file' => $file];
    }

    /**
     * Generate a PHP class file for a Raptor-managed package and write it to lib/Packages/.
     * The generated class extends \Gateway\Package so the extension's register_packages()
     * can instantiate and register it — making the package lifecycle tied to the extension plugin.
     */
    private function buildPackage(RaptorPackage $package, string $pluginDir, string $namespace): array
    {
        $className  = $this->packageKeyToClassName($package->package_key);
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

class {$className} extends \\Gateway\\Package\\Package
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
     * Delete the generated PHP file for a package (used before renaming).
     */
    public function deletePackageFile(RaptorPackage $package, RaptorExtension $extension): void
    {
        $pluginSlug = $this->toPluginSlug($extension->extension_key);
        $pluginDir  = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $className  = $this->packageKeyToClassName($package->package_key);
        $file       = $pluginDir . '/lib/Packages/' . $className . '.php';

        if (file_exists($file)) {
            @unlink($file);
        }
    }

    /**
     * Convert a package_key like "my-package" or "my_package" to "MyPackage".
     */
    public function packageKeyToClassName(string $key): string
    {
        return str_replace(['-', '_', ' '], '', ucwords($key, '-_ '));
    }

    /**
     * Build a single collection: generate the PHP class file and run the migration.
     */
    private function buildCollection(RaptorCollection $collection, string $pluginSlug, string $namespace): array
    {
        $fieldList = $collection->fieldList;
        $fields    = $fieldList ? $fieldList->fields()->orderBy('sort_order')->get() : collect();

        $seenNames = [];
        $warnings  = [];

        $normalizedFields = $fields->map(function ($f) {
            return array_merge(
                ['name' => sanitize_key($f->name), 'type' => $f->type, 'label' => $f->label],
                is_array($f->config) ? $f->config : []
            );
        })->filter(function ($f) use (&$warnings) {
            if (empty($f['name'])) {
                $warnings[] = 'Skipped a field with an empty/invalid name.';
                return false;
            }
            return true;
        })->values();

        $dedupedFields = $normalizedFields->filter(function ($f) use (&$seenNames, &$warnings) {
            if (isset($seenNames[$f['name']])) {
                $warnings[] = "Skipped duplicate field name '{$f['name']}' while building collection.";
                return false;
            }

            $seenNames[$f['name']] = true;
            return true;
        })->values();

        $collectionData = [
            'key'           => $collection->collection_key,
            'title'         => $collection->title,
            'registered'    => isset($collection->registered) ? (bool) $collection->registered : true,
            'relationships' => $collection->relationships ?? [],
            'fields'        => $dedupedFields->toArray(),
            'package_key'   => $collection->package_key ?? null,
            'label_field'   => $collection->label_field ?? null,
        ];

        $classResult     = \Gateway\Collections\FileFromData::generateCollectionClass(
            $collectionData, $pluginSlug, $namespace
        );
        $migrationResult = $this->generateAndRunMigration($collectionData, $pluginSlug, $namespace);
        $schemaResult    = JsonSchemaGenerator::generateAndWrite($collectionData, $pluginSlug);

        return [
            'collection_key'  => $collection->collection_key,
            'class_generated' => $classResult,
            'migration'       => $migrationResult,
            'schema'          => $schemaResult,
            'warnings'        => $warnings,
        ];
    }

    /**
     * Generate a migration PHP class from collection data, write it to the plugin,
     * then execute its ::create() method to provision the database table.
     */
    private function generateAndRunMigration(array $collectionData, string $pluginSlug, string $namespace): array
    {
        if (empty($collectionData['fields'])) {
            return [
                'success'            => true,
                'migration_generated' => false,
                'migration_ran'      => false,
                'message'            => 'No fields — migration skipped.',
            ];
        }

        $pluginDir    = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $databaseDir  = $pluginDir . '/lib/Database';

        if (!is_dir($databaseDir) && !wp_mkdir_p($databaseDir)) {
            return ['success' => false, 'migration_generated' => false, 'migration_ran' => false,
                    'error' => 'Failed to create Database directory.'];
        }

        $migration     = \Gateway\Database\MigrationGenerator::generateFromData($collectionData, $namespace);
        $migrationFile = $databaseDir . '/' . $migration['className'] . '.php';

        if (file_put_contents($migrationFile, $migration['code']) === false) {
            return ['success' => false, 'migration_generated' => false, 'migration_ran' => false,
                    'error' => 'Failed to write migration file.'];
        }

        require_once $migrationFile;

        $fullClass = $namespace . '\\Database\\' . $migration['className'];

        if (class_exists($fullClass) && method_exists($fullClass, 'create')) {
            $fullClass::create();
            return [
                'success'             => true,
                'migration_generated' => true,
                'migration_ran'       => true,
                'file'                => $migrationFile,
                'table'               => $collectionData['key'],
            ];
        }

        return [
            'success'             => false,
            'migration_generated' => true,
            'migration_ran'       => false,
            'error'               => "Class {$fullClass} not found or missing create().",
            'file'                => $migrationFile,
        ];
    }

    /**
     * Trigger a full extension build for the extension that owns the given collection.
     * No-ops if the collection has no extension.
     */
    /**
     * Rebuild the extension that owns the given collection.
     * Safe to call from any endpoint — swallows builder errors so the REST
     * response is never corrupted by a build failure.
     */
    public static function rebuildForCollection(RaptorCollection $collection): void
    {
        if (!$collection->extension_id) {
            return;
        }

        $collection->loadMissing('extension');

        if (!$collection->extension) {
            return;
        }

        try {
            (new static())->build($collection->extension->extension_key);
        } catch (\Throwable $e) {
            error_log('[Gateway] Rebuild failed for collection ' . $collection->collection_key . ': ' . $e->getMessage());
        }
    }

    public function buildFromCollection(RaptorCollection $collection): ?array
    {
        if (!$collection->extension_id) {
            return null;
        }

        $collection->loadMissing('extension');
        $extension = $collection->extension;

        if (!$extension) {
            return null;
        }

        return $this->build($extension->extension_key);
    }

    // ─── Output file helpers ──────────────────────────────────────────────────

    /**
     * Return the expected output file paths for a collection.
     *
     * Files may or may not exist yet (e.g. before the first build).
     * Each entry includes 'path' (absolute), 'relative' (from plugin root),
     * 'filename', and 'exists' (bool).
     *
     * @param  RaptorCollection $collection
     * @return array|null  null if the collection has no extension
     */
    public function outputFilesForCollection(\Gateway\Raptor\Collections\RaptorCollection $collection): ?array
    {
        if (!$collection->extension_id) {
            return null;
        }

        $collection->loadMissing('extension');
        $extension = $collection->extension;
        if (!$extension) {
            return null;
        }

        $pluginSlug = $this->toPluginSlug($extension->extension_key);
        $pluginDir  = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $className  = str_replace('_', '', ucwords($collection->collection_key, '_'));

        $entries = [
            [
                'relative' => 'lib/Collections/' . $className . '.php',
                'type'     => 'collection_class',
            ],
            [
                'relative' => 'schemas/' . $className . '.json',
                'type'     => 'json_schema',
            ],
        ];

        $files = [];
        foreach ($entries as $entry) {
            $abs            = $pluginDir . '/' . $entry['relative'];
            $files[] = [
                'filename' => basename($abs),
                'relative' => $entry['relative'],
                'path'     => $abs,
                'type'     => $entry['type'],
                'exists'   => file_exists($abs),
            ];
        }

        return $files;
    }

    // ─── Naming helpers ───────────────────────────────────────────────────────

    public function toPluginSlug(string $extensionKey): string
    {
        return str_replace('_', '-', $extensionKey);
    }

    public function toNamespace(string $extensionKey): string
    {
        return str_replace('_', '', ucwords($extensionKey, '_'));
    }
}
