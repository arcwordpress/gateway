<?php

namespace Gateway\Raptor\Build;

use Gateway\Raptor\Collections\RaptorCollection;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Builds all generated artifacts for a single Raptor collection.
 *
 * For every collection — regardless of whether it has custom fields — this class:
 *   1. Normalises and deduplicates the field list
 *   2. Writes the PHP collection class file (lib/Collections/)
 *   3. Writes and runs the database migration (lib/Database/)
 *   4. Writes the JSON schema (schemas/)
 *
 * The migration is ALWAYS generated. A collection with no custom fields still
 * receives a table with id + created_at + updated_at so the DB stays in sync
 * with every collection that exists in the registry.
 */
class CollectionBuilder
{
    /**
     * Build all artifacts for the given collection model.
     *
     * @param  RaptorCollection $collection
     * @param  string           $pluginSlug  e.g. "my-extension"
     * @param  string           $namespace   e.g. "MyExtension"
     * @return array
     */
    public function build(RaptorCollection $collection, string $pluginSlug, string $namespace): array
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

        $classResult     = \Gateway\Collections\FileFromData::generateCollectionClass($collectionData, $pluginSlug, $namespace);
        $migrationResult = $this->runMigration($collectionData, $pluginSlug, $namespace);
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
     * Generate the migration PHP class, write it to lib/Database/, then execute
     * its ::create() method to provision (or update) the database table.
     *
     * Always runs — collections with no custom fields still get a table.
     */
    public function runMigration(array $collectionData, string $pluginSlug, string $namespace): array
    {
        $databaseDir = WP_PLUGIN_DIR . '/' . $pluginSlug . '/lib/Database';

        if (!is_dir($databaseDir) && !wp_mkdir_p($databaseDir)) {
            return [
                'success'             => false,
                'migration_generated' => false,
                'migration_ran'       => false,
                'error'               => 'Failed to create Database directory.',
            ];
        }

        $migration     = \Gateway\Migrations\MigrationGenerator::generateFromData($collectionData, $namespace);
        $migrationFile = $databaseDir . '/' . $migration['className'] . '.php';

        if (file_put_contents($migrationFile, $migration['code']) === false) {
            return [
                'success'             => false,
                'migration_generated' => false,
                'migration_ran'       => false,
                'error'               => 'Failed to write migration file.',
            ];
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
     * Return the expected output file paths for a collection.
     * Each entry includes 'path', 'relative', 'filename', 'type', and 'exists'.
     */
    public function outputFilesFor(RaptorCollection $collection, string $pluginSlug): array
    {
        $pluginDir = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $className = str_replace('_', '', ucwords($collection->collection_key, '_'));

        $entries = [
            ['relative' => 'lib/Collections/' . $className . '.php', 'type' => 'collection_class'],
            ['relative' => 'schemas/' . $className . '.json',         'type' => 'json_schema'],
        ];

        $files = [];
        foreach ($entries as $entry) {
            $abs     = $pluginDir . '/' . $entry['relative'];
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
}
