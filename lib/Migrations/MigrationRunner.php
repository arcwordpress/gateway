<?php

namespace Gateway\Migrations;

use Gateway\Collection;
use Gateway\Plugin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration Runner
 *
 * Handles running database migrations for Gateway collections
 */
class MigrationRunner
{
    /**
     * Run migration for a specific collection
     *
     * @param string $collectionKey The collection key
     * @param bool $autoGenerate Whether to auto-generate migration if class doesn't exist
     * @param bool $saveToFile Whether to save generated migration to file
     * @return array ['success' => bool, 'message' => string, 'generated' => bool, 'filePath' => string|null]
     */
    public static function run($collectionKey, $autoGenerate = false, $saveToFile = false)
    {
        // Get the collection from registry
        $registry = Plugin::getInstance()->getRegistry();
        $collection = $registry->get($collectionKey);

        if (!$collection) {
            return [
                'success' => false,
                'message' => "Collection '{$collectionKey}' not found in registry",
                'generated' => false,
                'filePath' => null,
            ];
        }

        // Try to find existing migration class
        $migrationClass = self::findMigrationClass($collection);

        if ($migrationClass && class_exists($migrationClass)) {
            // Migration class exists, run it
            return self::runMigrationClass($migrationClass, $collection);
        }

        // Migration class doesn't exist
        if (!$autoGenerate) {
            return [
                'success' => false,
                'message' => "Migration class not found for '{$collectionKey}'. Generate the migration first or enable auto-generate.",
                'generated' => false,
                'filePath' => null,
            ];
        }

        // Auto-generate and optionally save
        return self::generateAndRun($collection, $saveToFile);
    }

    /**
     * Run migration for all registered collections
     *
     * @param bool $autoGenerate Whether to auto-generate migrations if classes don't exist
     * @param bool $saveToFile Whether to save generated migrations to file
     * @return array Array of results for each collection
     */
    public static function runAll($autoGenerate = false, $saveToFile = false)
    {
        $registry = Plugin::getInstance()->getRegistry();
        $collections = $registry->getAll();
        $results = [];

        foreach ($collections as $key => $collection) {
            $results[$key] = self::run($key, $autoGenerate, $saveToFile);
        }

        return $results;
    }

    /**
     * Find the migration class for a collection
     *
     * @param Collection $collection
     * @return string|null The fully qualified class name or null if not found
     */
    private static function findMigrationClass(Collection $collection)
    {
        $key = $collection->getCollectionKey();

        // Convert key to class name (same logic as MigrationGenerator)
        $className = str_replace(['-', '_'], ' ', $key);
        $className = ucwords($className);
        $className = str_replace(' ', '', $className);
        $migrationClassName = $className . 'Migration';

        // Check in Gateway\Migrations namespace (standard location)
        $standardClass = 'Gateway\\Migrations\\' . $migrationClassName;
        if (class_exists($standardClass)) {
            return $standardClass;
        }

        // Check in root namespace (for generated migrations without namespace)
        if (class_exists($migrationClassName)) {
            return $migrationClassName;
        }

        // Check for Database suffix variant (from MigrationGenerator)
        $databaseClassName = $className . 'Database';
        $standardDatabaseClass = 'Gateway\\Migrations\\' . $databaseClassName;
        if (class_exists($standardDatabaseClass)) {
            return $standardDatabaseClass;
        }

        if (class_exists($databaseClassName)) {
            return $databaseClassName;
        }

        return null;
    }

    /**
     * Run a migration class
     *
     * @param string $className
     * @param Collection $collection
     * @return array
     */
    private static function runMigrationClass($className, Collection $collection)
    {
        try {
            // Check if the class has a create method
            if (!method_exists($className, 'create')) {
                return [
                    'success' => false,
                    'message' => "Migration class '{$className}' does not have a create() method",
                    'generated' => false,
                    'filePath' => null,
                ];
            }

            // Run the migration
            $className::create();

            return [
                'success' => true,
                'message' => "Successfully ran migration for '{$collection->getCollectionKey()}' using class '{$className}'",
                'generated' => false,
                'filePath' => null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => "Error running migration: {$e->getMessage()}",
                'generated' => false,
                'filePath' => null,
            ];
        }
    }

    /**
     * Generate migration code and run it
     *
     * @param Collection $collection
     * @param bool $saveToFile Whether to save to file
     * @return array
     */
    private static function generateAndRun(Collection $collection, $saveToFile = false)
    {
        try {
            // Generate the migration
            $migration = MigrationGenerator::generate($collection);

            // If saving to file, save it
            $filePath = null;
            if ($saveToFile) {
                $filePath = self::saveMigrationToFile($migration, $collection);
            }

            // Run the migration code directly by evaluating it
            // We need to strip the opening <?php tag and any namespace declarations
            $codeToEval = $migration['code'];
            $codeToEval = preg_replace('/<\?php\s*/', '', $codeToEval, 1);
            $codeToEval = preg_replace('/namespace\s+[^;]+;/', '', $codeToEval);

            // Evaluate the code to define the class
            eval($codeToEval);

            // Now call the create method
            $className = $migration['className'];
            if (class_exists($className)) {
                $className::create();

                return [
                    'success' => true,
                    'message' => "Successfully generated and ran migration for '{$collection->getCollectionKey()}'",
                    'generated' => true,
                    'filePath' => $filePath,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => "Failed to create migration class '{$className}'",
                    'generated' => true,
                    'filePath' => $filePath,
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => "Error generating/running migration: {$e->getMessage()}",
                'generated' => false,
                'filePath' => null,
            ];
        }
    }

    /**
     * Save migration code to file
     *
     * @param array $migration Migration data from MigrationGenerator
     * @param Collection $collection
     * @return string|null File path or null on failure
     */
    private static function saveMigrationToFile($migration, Collection $collection)
    {
        $migrationsDir = GATEWAY_PLUGIN_DIR . 'lib/Migrations/';

        // Ensure directory exists
        if (!is_dir($migrationsDir)) {
            wp_mkdir_p($migrationsDir);
        }

        // Convert className to Migration format (instead of Database)
        $className = str_replace('Database', 'Migration', $migration['className']);
        $fileName = $className . '.php';
        $filePath = $migrationsDir . $fileName;

        // Update code with namespace and Migration class name
        $code = "<?php\n\nnamespace Gateway\\Migrations;\n\n";
        $code .= "// Exit if accessed directly\n";
        $code .= "if (!defined('ABSPATH')) {\n";
        $code .= "    exit;\n";
        $code .= "}\n\n";

        // Remove <?php tag and add the rest
        $originalCode = $migration['code'];
        $originalCode = preg_replace('/<\?php\s*/', '', $originalCode, 1);

        // Replace Database with Migration in class name
        $originalCode = str_replace($migration['className'], $className, $originalCode);

        $code .= $originalCode;

        // Save to file
        $result = file_put_contents($filePath, $code);

        return $result !== false ? $filePath : null;
    }

    /**
     * Check if a migration exists for a collection
     *
     * @param string $collectionKey
     * @return bool
     */
    public static function exists($collectionKey)
    {
        $registry = Plugin::getInstance()->getRegistry();
        $collection = $registry->get($collectionKey);

        if (!$collection) {
            return false;
        }

        $migrationClass = self::findMigrationClass($collection);
        return $migrationClass !== null && class_exists($migrationClass);
    }

    /**
     * Check if table exists for a collection
     *
     * @param string $collectionKey
     * @return bool
     */
    public static function tableExists($collectionKey)
    {
        global $wpdb;

        $registry = Plugin::getInstance()->getRegistry();
        $collection = $registry->get($collectionKey);

        if (!$collection) {
            return false;
        }

        $tableName = $wpdb->prefix . $collection->getTable();
        $result = $wpdb->get_var("SHOW TABLES LIKE '$tableName'");

        return $result === $tableName;
    }
}
