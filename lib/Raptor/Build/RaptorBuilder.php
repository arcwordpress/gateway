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
 * Orchestrates a full extension build.
 *
 * This class is responsible only for coordination:
 *   - Loading extension/collection/package data from the database
 *   - Delegating file generation to the specialised builder classes
 *   - Activating the plugin and recording the migration version
 *
 * All file-writing logic lives in:
 *   - PluginScaffolder  — plugin entry file + Extension.php
 *   - PackageBuilder    — package PHP class files
 *   - CollectionBuilder — collection class + migration + JSON schema
 *
 * Naming conventions mirror Exta's:
 *   extension_key "my_ext" → plugin slug "my-ext"
 *                          → PHP namespace "MyExt"
 *                          → constant prefix "MY_EXT"
 */
class RaptorBuilder
{
    private PluginScaffolder $scaffolder;
    private PackageBuilder   $packageBuilder;
    private CollectionBuilder $collectionBuilder;

    public function __construct(
        ?PluginScaffolder  $scaffolder         = null,
        ?PackageBuilder    $packageBuilder     = null,
        ?CollectionBuilder $collectionBuilder  = null
    ) {
        $this->scaffolder        = $scaffolder        ?? new PluginScaffolder();
        $this->packageBuilder    = $packageBuilder    ?? new PackageBuilder();
        $this->collectionBuilder = $collectionBuilder ?? new CollectionBuilder();
    }

    // ─── Primary build entry point ────────────────────────────────────────────

    /**
     * Full build: regenerate all plugin files for the given extension.
     * Every collection gets a migration on every build — no skipping.
     */
    public function build(string $extensionKey): array
    {
        $extension = RaptorExtension::where('extension_key', $extensionKey)->first();
        if (!$extension) {
            return ['success' => false, 'error' => "Extension '{$extensionKey}' not found."];
        }

        $pluginSlug     = $this->toPluginSlug($extensionKey);
        $namespace      = !empty($extension->namespace) ? $extension->namespace : $this->toNamespace($extensionKey);
        $constantPrefix = strtoupper($extensionKey);
        $projectName    = $extension->title ?: ucwords(str_replace('_', ' ', $extensionKey));
        $pluginDir      = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $pluginFile     = $pluginSlug . '/' . $pluginSlug . '.php';

        if (!function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $wasActive = is_plugin_active($pluginFile);

        $scaffoldResult = $this->scaffolder->scaffold(
            $pluginDir, $pluginSlug, $namespace, $constantPrefix, $projectName, $extension
        );

        // Rebuild packages — remove stale files for any packages no longer active.
        $packages    = $extension->packages()->where('status', 'active')->get();
        $packagesDir = $pluginDir . '/lib/Packages';
        if (is_dir($packagesDir)) {
            $activeFiles = $packages->map(fn($p) => $this->packageBuilder->keyToClassName($p->package_key) . '.php')->toArray();
            foreach (glob($packagesDir . '/*.php') ?: [] as $file) {
                if (!in_array(basename($file), $activeFiles, true)) {
                    @unlink($file);
                }
            }
        }

        $packageResults = [];
        foreach ($packages as $package) {
            $packageResults[] = $this->packageBuilder->build($package, $pluginDir, $namespace);
        }

        // Rebuild every collection — remove stale files first, then regenerate.
        $collections = RaptorCollection::where('extension_id', $extension->id)
            ->with(['fieldList.fields'])
            ->orderBy('id')
            ->get();

        $activeCollectionFiles = $collections->map(
            fn($c) => str_replace('_', '', ucwords($c->collection_key, '_')) . '.php'
        )->toArray();

        foreach (['lib/Collections', 'lib/Migrations', 'schemas'] as $dir) {
            $ext = $dir === 'schemas' ? '.json' : '.php';
            $fullDir = $pluginDir . '/' . $dir;
            if (!is_dir($fullDir)) continue;
            foreach (glob($fullDir . '/*' . $ext) ?: [] as $file) {
                $base = basename($file, $ext) . '.php'; // normalise to .php for comparison
                if (!in_array($base, $activeCollectionFiles, true)) {
                    @unlink($file);
                }
            }
        }

        $collectionResults = [];
        foreach ($collections as $collection) {
            $collectionResults[] = $this->collectionBuilder->build($collection, $pluginSlug, $namespace);
        }

        $activationResult = $wasActive
            ? ['activated' => false, 'already_active' => true]
            : $this->scaffolder->activate($pluginSlug);

        // Determine if all collection migrations succeeded.
        $allMigrationsOk = true;
        $migrationMessages = [];
        foreach ($collectionResults as $cr) {
            $migrationResult = $cr['migration'] ?? [];
            if (!empty($migrationResult['migration_generated']) && empty($migrationResult['migration_ran'])) {
                $allMigrationsOk = false;
                $migrationMessages[] = $cr['collection_key'] . ': ' . ($migrationResult['error'] ?? 'migration did not run');
            }
        }

        // Only mark migrations as done when every collection table was provisioned.
        if ($allMigrationsOk) {
            $extension->update([
                'migration_version' => $extension->version,
                'migrations_ran_at' => current_time('mysql', true),
            ]);
        }

        // Log the run regardless of outcome.
        $logMessage = $allMigrationsOk ? '' : implode('; ', $migrationMessages);
        \Gateway\Collections\Gateway\MigrationRun::log(
            'extension',
            $extensionKey,
            $extension->version,
            $allMigrationsOk,
            $logMessage
        );

        return [
            'success'           => true,
            'plugin_slug'       => $pluginSlug,
            'plugin_dir'        => $pluginDir,
            'namespace'         => $namespace,
            'scaffold'          => $scaffoldResult,
            'packages'          => $packageResults,
            'package_count'     => count($packageResults),
            'collections'       => $collectionResults,
            'collection_count'  => count($collectionResults),
            'activation'        => $activationResult,
            'migration_version' => $extension->version,
            'migrations_ran_at' => $extension->migrations_ran_at,
        ];
    }

    // ─── Convenience / static helpers used by REST endpoints ─────────────────

    /**
     * Rebuild the extension that owns the given collection.
     * Safe to call from any endpoint — logs but never throws.
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

    /**
     * Run a full build for the extension that owns the given collection.
     */
    public function buildFromCollection(RaptorCollection $collection): ?array
    {
        if (!$collection->extension_id) {
            return null;
        }

        $collection->loadMissing('extension');

        if (!$collection->extension) {
            return null;
        }

        return $this->build($collection->extension->extension_key);
    }

    /**
     * Return the expected output file paths for a collection.
     * Delegates to CollectionBuilder.
     */
    public function outputFilesForCollection(RaptorCollection $collection): ?array
    {
        if (!$collection->extension_id) {
            return null;
        }

        $collection->loadMissing('extension');

        if (!$collection->extension) {
            return null;
        }

        $pluginSlug = $this->toPluginSlug($collection->extension->extension_key);
        return $this->collectionBuilder->outputFilesFor($collection, $pluginSlug);
    }

    // ─── Delegating wrappers kept for backwards compatibility with callers ────

    /**
     * @see PluginScaffolder::buildExtensionFile()
     */
    public function buildExtensionFile(string $pluginDir, string $namespace, RaptorExtension $extension): array
    {
        return $this->scaffolder->buildExtensionFile($pluginDir, $namespace, $extension);
    }

    /**
     * @see PluginScaffolder::activate()
     */
    public function activatePlugin(string $pluginSlug): array
    {
        return $this->scaffolder->activate($pluginSlug);
    }

    /**
     * @see PackageBuilder::delete()
     */
    public function deletePackageFile(RaptorPackage $package, RaptorExtension $extension): void
    {
        $this->packageBuilder->delete($package, $this->toPluginSlug($extension->extension_key));
    }

    /**
     * @see PackageBuilder::keyToClassName()
     */
    public function packageKeyToClassName(string $key): string
    {
        return $this->packageBuilder->keyToClassName($key);
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
