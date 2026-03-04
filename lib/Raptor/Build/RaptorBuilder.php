<?php

namespace Gateway\Raptor\Build;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorExtension;

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

        $scaffoldResult = $this->scaffoldPlugin(
            $pluginDir, $pluginSlug, $namespace, $constantPrefix, $projectName, $extension
        );

        $collections = RaptorCollection::where('extension_id', $extension->id)
            ->with('fieldList.fields')
            ->orderBy('id')
            ->get();

        $collectionResults = [];
        foreach ($collections as $collection) {
            $collectionResults[] = $this->buildCollection($collection, $pluginSlug, $namespace);
        }

        return [
            'success'            => true,
            'plugin_slug'        => $pluginSlug,
            'plugin_dir'         => $pluginDir,
            'namespace'          => $namespace,
            'scaffold'           => $scaffoldResult,
            'collections'        => $collectionResults,
            'collection_count'   => count($collectionResults),
        ];
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
        if (!is_dir($pluginDir . '/lib/Collections')) {
            if (!wp_mkdir_p($pluginDir . '/lib/Collections')) {
                return ['success' => false, 'error' => 'Failed to create plugin directory structure.'];
            }
        }

        $pluginFile = $pluginDir . '/' . $pluginSlug . '.php';

        if (file_exists($pluginFile)) {
            return ['success' => true, 'skipped' => true, 'plugin_file' => $pluginFile];
        }

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

        return ['success' => true, 'skipped' => false, 'plugin_file' => $pluginFile];
    }

    /**
     * Build a single collection: generate the PHP class file and run the migration.
     */
    private function buildCollection(RaptorCollection $collection, string $pluginSlug, string $namespace): array
    {
        $fieldList = $collection->fieldList;
        $fields    = $fieldList ? $fieldList->fields()->orderBy('sort_order')->get() : collect();

        $collectionData = [
            'key'           => $collection->collection_key,
            'title'         => $collection->title,
            'relationships' => $collection->relationships ?? [],
            'fields'        => $fields->map(function ($f) {
                return array_merge(
                    ['name' => $f->name, 'type' => $f->type, 'label' => $f->label],
                    is_array($f->config) ? $f->config : []
                );
            })->toArray(),
        ];

        $classResult     = \Gateway\Collections\FileFromData::generateCollectionClass(
            $collectionData, $pluginSlug, $namespace
        );
        $migrationResult = $this->generateAndRunMigration($collectionData, $pluginSlug, $namespace);

        return [
            'collection_key'  => $collection->collection_key,
            'class_generated' => $classResult,
            'migration'       => $migrationResult,
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
