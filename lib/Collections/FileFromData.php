<?php

namespace Gateway\Collections;

/**
 * File From Data - Generates collection PHP class from JSON data
 */
class FileFromData
{
    /**
     * Generate collection class file from JSON data
     * 
     * @param array $collectionData Collection data array
     * @param string $pluginSlug Plugin slug (e.g., 'horizon')
     * @param string $pluginNamespace Plugin namespace (e.g., 'Horizon')
     * @return bool True on success, false on failure
     */
    public static function generateCollectionClass($collectionData, $pluginSlug, $pluginNamespace)
    {
        if (empty($collectionData['key'])) {
            error_log('[Gateway] Collection key missing, cannot generate class');
            return false;
        }

        // Fields can be empty for new collections - they'll be added later
        if (!isset($collectionData['fields'])) {
            $collectionData['fields'] = [];
        }

        $pluginDir = WP_PLUGIN_DIR . '/' . $pluginSlug;
        
        // Ensure plugin directory exists
        if (!is_dir($pluginDir)) {
            error_log("[Gateway] Plugin directory does not exist: {$pluginDir}");
            return false;
        }
        
        // Ensure Collections directory exists
        $collectionsDir = $pluginDir . '/lib/Collections';
        if (!is_dir($collectionsDir)) {
            if (!wp_mkdir_p($collectionsDir)) {
                error_log("[Gateway] Failed to create Collections directory: {$collectionsDir}");
                return false;
            }
        }
        
        // Load template
        $templatePath = GATEWAY_PATH . 'templates/scaffold/collection_class.php';
        if (!file_exists($templatePath)) {
            error_log("[Gateway] Collection template not found: {$templatePath}");
            return false;
        }
        
        $template = file_get_contents($templatePath);
        
        // Generate class name from collection key (e.g., social_post -> SocialPost)
        $className = self::keyToClassName($collectionData['key']);

        // Use provided title or generate from key (e.g., social_post -> Social Post)
        $title = isset($collectionData['title']) && !empty($collectionData['title'])
            ? $collectionData['title']
            : self::keyToTitle($collectionData['key']);

        // Convert fields array to formatted PHP array string
        $fieldsPhp = self::arrayToPhp($collectionData['fields']);
        
        // Replace placeholders
        $replacements = [
            '{{NAMESPACE}}' => $pluginNamespace,
            '{{CLASS_NAME}}' => $className,
            '{{COLLECTION_KEY}}' => $collectionData['key'],
            '{{COLLECTION_TITLE}}' => $title,
            '{{FIELDS_JSON}}' => $fieldsPhp,
        ];
        
        $classContent = str_replace(array_keys($replacements), array_values($replacements), $template);
        
        // Save to lib/Collections directory
        $filePath = $collectionsDir . '/' . $className . '.php';
        $result = file_put_contents($filePath, $classContent);

        if ($result === false) {
            error_log("[Gateway] Failed to write collection class to: {$filePath}");
            return false;
        }

        chmod($filePath, 0644);

        $fieldCount = isset($collectionData['fields']) ? count($collectionData['fields']) : 0;
        error_log("[Gateway] Generated collection class: {$filePath} with {$fieldCount} fields");
        return true;
    }
    
    /**
     * Convert collection key to class name
     * Example: social_post -> SocialPost
     * 
     * @param string $key Collection key
     * @return string Class name
     */
    private static function keyToClassName($key)
    {
        return str_replace('_', '', ucwords($key, '_'));
    }
    
    /**
     * Convert collection key to title
     * Example: social_post -> Social Post
     * 
     * @param string $key Collection key
     * @return string Title
     */
    private static function keyToTitle($key)
    {
        return ucwords(str_replace('_', ' ', $key));
    }
    
    /**
     * Convert PHP array to formatted string representation
     *
     * @param array $array Array to convert
     * @param int $indent Indentation level
     * @return string Formatted PHP array string
     */
    private static function arrayToPhp($array, $indent = 1)
    {
        if (empty($array)) {
            return "[]";
        }

        $indentStr = str_repeat('    ', $indent);
        $innerIndentStr = str_repeat('    ', $indent + 1);
        $lines = ["["];

        foreach ($array as $item) {
            if (!is_array($item)) {
                // Handle non-array items (shouldn't happen for fields, but just in case)
                $lines[] = $indentStr . self::valueToPhp($item) . ",";
                continue;
            }

            $lines[] = $indentStr . "[";
            foreach ($item as $key => $value) {
                $phpValue = self::valueToPhp($value);
                $lines[] = $innerIndentStr . "'{$key}' => {$phpValue},";
            }
            $lines[] = $indentStr . "],";
        }

        $lines[] = str_repeat('    ', $indent - 1) . "]";

        return implode("\n", $lines);
    }

    /**
     * Convert a PHP value to its string representation for code generation
     *
     * @param mixed $value Value to convert
     * @return string PHP code representation
     */
    private static function valueToPhp($value)
    {
        if (is_null($value)) {
            return 'null';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_numeric($value)) {
            return $value;
        }

        if (is_array($value)) {
            // Handle nested arrays
            return str_replace("\n", "\n    ", var_export($value, true));
        }

        // String - escape single quotes
        return "'" . str_replace("'", "\\'", $value) . "'";
    }
}