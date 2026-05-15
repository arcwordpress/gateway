<?php

namespace Gateway\Migrations;

use Gateway\Collection;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration Generator
 *
 * Generates WordPress dbDelta migration code for Gateway collections
 */
class MigrationGenerator
{
    /**
     * Field type to database column type mapping
     */
    private static $fieldTypeMap = [
        'text' => 'VARCHAR(255)',
        'textarea' => 'TEXT',
        'wysiwyg' => 'LONGTEXT',
        'editor' => 'LONGTEXT',
        'number' => 'BIGINT',
        'email' => 'VARCHAR(255)',
        'url' => 'VARCHAR(512)',
        'tel' => 'VARCHAR(20)',
        'date' => 'DATE',
        'datetime' => 'DATETIME',
        'time' => 'TIME',
        'checkbox' => 'TINYINT(1)',
        'radio' => 'VARCHAR(255)',
        'select' => 'VARCHAR(255)',
        'image' => 'BIGINT UNSIGNED', // WordPress attachment ID
        'file' => 'BIGINT UNSIGNED', // WordPress attachment ID
        'gallery' => 'TEXT', // Comma-separated IDs
        'color' => 'VARCHAR(7)',
        'password' => 'VARCHAR(255)',
    ];

    /**
     * Cast type to database column type mapping
     */
    private static $castTypeMap = [
        'int' => 'BIGINT',
        'integer' => 'BIGINT',
        'real' => 'DOUBLE',
        'float' => 'DOUBLE',
        'double' => 'DOUBLE',
        'decimal' => 'DECIMAL(10,2)',
        'string' => 'VARCHAR(255)',
        'bool' => 'TINYINT(1)',
        'boolean' => 'TINYINT(1)',
        'object' => 'TEXT',
        'array' => 'TEXT',
        'collection' => 'TEXT',
        'date' => 'DATE',
        'datetime' => 'DATETIME',
        'timestamp' => 'TIMESTAMP',
        'json' => 'LONGTEXT',
    ];

    /**
     * Generate migration code for a collection
     *
     * @param Collection $collection
     * @return array ['code' => string, 'className' => string, 'notes' => array]
     */
    public static function generate(Collection $collection)
    {
        $className = self::getClassName($collection);
        $tableName = $collection->getTable();
        $fillable = $collection->getFillable();
        $casts = $collection->getCasts();
        $fields = $collection->getFields();
        $timestamps = $collection->timestamps;

        // Track notes for the developer
        $notes = [];
        $columns = [];

        // Always start with id
        $columns[] = "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY";

        // Process fillable columns
        foreach ($fillable as $column) {
            // Skip id if it's in fillable
            if ($column === 'id') {
                continue;
            }

            // Skip timestamp columns if timestamps are enabled (we add them at the end)
            if ($timestamps && in_array($column, ['created_at', 'updated_at'])) {
                continue;
            }

            $columnDefinition = self::getColumnDefinition($column, $fields, $casts, $notes);
            $columns[] = $columnDefinition;
        }

        // Add timestamp columns if enabled
        if ($timestamps) {
            $columns[] = "created_at TIMESTAMP NULL DEFAULT NULL";
            $columns[] = "updated_at TIMESTAMP NULL DEFAULT NULL";
        }

        // Generate the PHP class code
        $code = self::generateClassCode($className, $tableName, $columns, $notes);

        return [
            'code' => $code,
            'className' => $className,
            'tableName' => $tableName,
            'notes' => $notes,
        ];
    }

    /**
     * Get the class name for the migration
     *
     * @param Collection $collection
     * @return string
     */
    private static function getClassName(Collection $collection)
    {
        $key = $collection->getKey();

        // Convert to PascalCase if needed
        $className = str_replace(['-', '_'], ' ', $key);
        $className = ucwords($className);
        $className = str_replace(' ', '', $className);

        return $className . 'Database';
    }

    /**
     * Get column definition for a field
     *
     * @param string $column
     * @param array $fields
     * @param array $casts
     * @param array &$notes
     * @return string
     */
    private static function getColumnDefinition($column, $fields, $casts, &$notes)
    {
        $type = null;
        $nullable = true; // Default to nullable
        $default = null;

        // First, try to determine type from $fields array
        if (isset($fields[$column])) {
            $field = $fields[$column];
            $fieldType = $field['type'] ?? null;

            if ($fieldType && isset(self::$fieldTypeMap[$fieldType])) {
                $type = self::$fieldTypeMap[$fieldType];
            }

            // Check if field is required
            if (isset($field['required']) && $field['required']) {
                $nullable = false;
            }

            // Check for default value
            if (isset($field['default'])) {
                $default = $field['default'];
            }
        }

        // If no type found, try $casts array
        if (!$type && isset($casts[$column])) {
            $castType = $casts[$column];

            if (isset(self::$castTypeMap[$castType])) {
                $type = self::$castTypeMap[$castType];
            } else {
                // Unknown cast type
                $notes[] = "Unknown cast type '{$castType}' for column '{$column}', defaulting to TEXT";
                $type = 'TEXT';
            }
        }

        // Default to VARCHAR if still no type
        if (!$type) {
            $notes[] = "Could not determine column type for '{$column}', defaulting to VARCHAR(255)";
            $type = 'VARCHAR(255)';
        }

        // Build the column definition
        $definition = "{$column} {$type}";

        if (!$nullable) {
            $definition .= " NOT NULL";
        } else {
            $definition .= " NULL";
        }

        // Add default value if specified
        if ($default !== null) {
            if (is_string($default)) {
                $definition .= " DEFAULT '{$default}'";
            } elseif (is_bool($default)) {
                $definition .= " DEFAULT " . ($default ? '1' : '0');
            } else {
                $definition .= " DEFAULT {$default}";
            }
        }

        return $definition;
    }

    /**
     * Generate the complete PHP class code
     *
     * @param string $className
     * @param string $tableName
     * @param array $columns
     * @param array $notes
     * @return string
     */
    private static function generateClassCode($className, $tableName, $columns, $notes)
    {
        global $wpdb;

        // Format columns for the SQL statement
        $columnsStr = implode(",\n            ", $columns);

        // Generate notes section
        $notesSection = '';
        if (!empty($notes)) {
            $notesSection = "\n    /**\n     * NOTES:\n";
            foreach ($notes as $note) {
                $notesSection .= "     * - {$note}\n";
            }
            $notesSection .= "     */\n";
        }

        // Build code using string concatenation to avoid heredoc issues in namespaced files
        $code = "<?php\n\n";
        $code .= "/**\n";
        $code .= " * Database Migration: {$className}\n";
        $code .= " *\n";
        $code .= " * This class creates the database table for the collection.\n";
        $code .= " *\n";
        $code .= " * USAGE INSTRUCTIONS:\n";
        $code .= " * 1. Save this file to your plugin (e.g., /lib/{$className}.php)\n";
        $code .= " * 2. Require the file in your plugin\n";
        $code .= " * 3. Call {$className}::create() from your plugin activation hook\n";
        $code .= " *\n";
        $code .= " * Example:\n";
        $code .= " * register_activation_hook(__FILE__, function() {\n";
        $code .= " *     require_once plugin_dir_path(__FILE__) . 'lib/{$className}.php';\n";
        $code .= " *     {$className}::create();\n";
        $code .= " * });\n";
        $code .= " */\n";
        $code .= "class {$className}\n";
        $code .= "{\n";
        $code .= $notesSection;
        $code .= "    /**\n";
        $code .= "     * Create or update the database table\n";
        $code .= "     *\n";
        $code .= "     * This method uses WordPress's dbDelta() function which safely\n";
        $code .= "     * handles both table creation and updates.\n";
        $code .= "     */\n";
        $code .= "    public static function create()\n";
        $code .= "    {\n";
        $code .= "        global \$wpdb;\n\n";
        $code .= "        \$table_name = \$wpdb->prefix . '{$tableName}';\n";
        $code .= "        \$charset_collate = \$wpdb->get_charset_collate();\n\n";
        $code .= "        \$sql = \"CREATE TABLE \$table_name (\n";
        $code .= "            {$columnsStr}\n";
        $code .= "        ) \$charset_collate;\";\n\n";
        $code .= "        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');\n";
        $code .= "        dbDelta(\$sql);\n";
        $code .= "    }\n";
        $code .= "}\n";

        return $code;
    }

    /**
     * Generate migration code for all registered collections
     *
     * @return array Array of migration data for each collection
     */
    public static function generateAll()
    {
        $registry = \Gateway\Plugin::getInstance()->getRegistry();
        $collections = $registry->getAll();
        $migrations = [];

        foreach ($collections as $key => $collection) {
            $migrations[$key] = self::generate($collection);
        }

        return $migrations;
    }

    /**
     * Install migration to an extension's Database directory
     *
     * @param Collection $collection
     * @param \Gateway\Extension $extension
     * @return array ['success' => bool, 'filePath' => string, 'message' => string, 'migration' => array]
     */
    public static function installToExtension(Collection $collection, \Gateway\Extension $extension)
    {
        // Check if extension has standard structure
        if (!$extension->hasStandardStructure()) {
            $databasePath = $extension->getDatabasePath();
            return [
                'success' => false,
                'message' => "Extension does not have standard directory structure. Expected directory: {$databasePath}",
                'filePath' => null,
                'migration' => null,
            ];
        }

        // Generate the migration
        $migration = self::generate($collection);

        // Build the file path
        $databasePath = $extension->getDatabasePath();
        $fileName = $migration['className'] . '.php';
        $filePath = $databasePath . '/' . $fileName;

        // Check if file already exists
        if (file_exists($filePath)) {
            return [
                'success' => false,
                'message' => "Migration file already exists: {$fileName}",
                'filePath' => $filePath,
                'migration' => $migration,
            ];
        }

        // Write the file
        $result = file_put_contents($filePath, $migration['code']);

        if ($result === false) {
            return [
                'success' => false,
                'message' => "Failed to write migration file. Check directory permissions.",
                'filePath' => $filePath,
                'migration' => $migration,
            ];
        }

        return [
            'success' => true,
            'message' => "Migration successfully installed to extension",
            'filePath' => $filePath,
            'migration' => $migration,
        ];
    }

    /**
     * Generate migration code from raw collection data (JSON-based)
     * Used for Builder (Exta) collections that aren't registered yet
     *
     * @param array $collectionData Collection data array with 'key', 'title', 'fields'
     * @param string $namespace Plugin namespace (e.g., 'MyExtension')
     * @param string|null $extensionKey Extension registry key (e.g., 'my-extension')
     * @return array ['code' => string, 'className' => string, 'notes' => array]
     */
    public static function generateFromData($collectionData, $namespace = null, $extensionKey = null)
    {
        $key = $collectionData['key'] ?? null;
        $title = $collectionData['title'] ?? null;
        $fields = $collectionData['fields'] ?? [];

        if (!$key) {
            throw new \InvalidArgumentException('Collection key is required');
        }

        // Generate class name
        $className = self::getClassNameFromKey($key);

        // Generate table name from key
        $tableName = $key;

        // Track notes for the developer
        $notes = [];
        $columns = [];

        // Always start with id (no inline PRIMARY KEY — dbDelta requires it on its own line)
        $columns[] = "id bigint(20) unsigned NOT NULL AUTO_INCREMENT";

        // Process fields
        foreach ($fields as $field) {
            $fieldName = $field['name'] ?? null;
            if (!$fieldName) {
                $notes[] = "Skipping field without name";
                continue;
            }

            $columnDefinition = self::getColumnDefinitionFromField($field, $notes);
            $columns[] = $columnDefinition;
        }

        // Add timestamp columns (always include for consistency)
        $columns[] = "created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP";
        $columns[] = "updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
        // dbDelta requires PRIMARY KEY on its own line with two spaces
        $columns[] = "PRIMARY KEY  (id)";

        // Generate the PHP class code
        $code = self::generateClassCodeWithNamespace($className, $tableName, $columns, $notes, $namespace, $extensionKey);

        return [
            'code' => $code,
            'className' => $className,
            'tableName' => $tableName,
            'notes' => $notes,
        ];
    }

    /**
     * Get class name from collection key
     *
     * @param string $key
     * @return string
     */
    private static function getClassNameFromKey($key)
    {
        $className = str_replace(['-', '_'], ' ', $key);
        $className = ucwords($className);
        $className = str_replace(' ', '', $className);
        return $className . 'Migration';
    }

    /**
     * Get column definition from field data
     *
     * @param array $field
     * @param array &$notes
     * @return string
     */
    private static function getColumnDefinitionFromField($field, &$notes)
    {
        $fieldName = $field['name'];
        $fieldType = $field['type'] ?? 'text';
        $required = $field['required'] ?? false;
        $default = $field['default'] ?? null;

        // Determine database column type
        $dbType = self::$fieldTypeMap[$fieldType] ?? 'VARCHAR(255)';

        // Build the column definition
        $definition = "{$fieldName} {$dbType}";

        if ($required) {
            $definition .= " NOT NULL";
        } else {
            $definition .= " NULL";
        }

        // Add default value if specified
        if ($default !== null) {
            if (is_string($default)) {
                $definition .= " DEFAULT '" . esc_sql($default) . "'";
            } elseif (is_bool($default)) {
                $definition .= " DEFAULT " . ($default ? '1' : '0');
            } else {
                $definition .= " DEFAULT {$default}";
            }
        } elseif ($required && in_array($fieldType, ['text', 'textarea', 'wysiwyg', 'editor'])) {
            // Text fields that are required should default to empty string
            $definition .= " DEFAULT ''";
        }

        return $definition;
    }

    /**
     * Generate class code with namespace support
     *
     * @param string $className
     * @param string $tableName
     * @param array $columns
     * @param array $notes
     * @param string|null $namespace
     * @param string|null $extensionKey
     * @return string
     */
    private static function generateClassCodeWithNamespace($className, $tableName, $columns, $notes, $namespace = null, $extensionKey = null)
    {
        $columnsStr = implode(",\n            ", $columns);

        $notesSection = '';
        if (!empty($notes)) {
            $notesSection = "\n    /**\n     * NOTES:\n";
            foreach ($notes as $note) {
                $notesSection .= "     * - {$note}\n";
            }
            $notesSection .= "     */\n";
        }

        $ext = $extensionKey ? addslashes($extensionKey) : '';

        $code = "<?php\n\n";

        if ($namespace) {
            $code .= "namespace {$namespace}\\Migrations;\n\n";
        }

        $code .= "if (!defined('ABSPATH')) {\n";
        $code .= "    exit;\n";
        $code .= "}\n\n";

        $code .= "class {$className} extends \\Gateway\\Migration\n";
        $code .= "{\n";
        $code .= $notesSection;
        $code .= "    protected static string \$extension = '{$ext}';\n";
        $code .= "    protected static ?string \$version  = null;\n\n";
        $code .= "    public static function create(): void\n";
        $code .= "    {\n";
        $code .= "        global \$wpdb;\n\n";
        $code .= "        \$table_name      = \$wpdb->prefix . '{$tableName}';\n";
        $code .= "        \$charset_collate = \$wpdb->get_charset_collate();\n\n";
        $code .= "        \$sql = \"CREATE TABLE \$table_name (\n";
        $code .= "            {$columnsStr}\n";
        $code .= "        ) \$charset_collate;\";\n\n";
        $code .= "        require_once ABSPATH . 'wp-admin/includes/upgrade.php';\n";
        $code .= "        dbDelta(\$sql);\n";
        $code .= "    }\n";
        $code .= "}\n";

        return $code;
    }

    /**
     * Get all extensions that have the standard directory structure
     *
     * @return array Array of Extension instances
     */
    public static function getAvailableExtensions()
    {
        $extensionRegistry = \Gateway\Extensions\ExtensionRegistry::instance();
        $extensions = $extensionRegistry->getAll();
        $available = [];

        foreach ($extensions as $key => $extension) {
            if ($extension->hasStandardStructure()) {
                $available[$key] = $extension;
            }
        }

        return $available;
    }
}
