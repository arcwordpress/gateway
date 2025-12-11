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
     * @param string $namespace Plugin namespace (e.g., 'Horizon')
     * @return bool True on success, false on failure
     */
    public static function generateCollectionClass($collectionData, $pluginSlug = 'horizon', $namespace = 'Horizon')
    {
        if (empty($collectionData['key']) || empty($collectionData['fields'])) {
            error_log('[Gateway] Collection key or fields missing, cannot generate class');
            return false;
        }
        
        $pluginDir = WP_PLUGIN_DIR . '/' . $pluginSlug;
        
        // Ensure plugin directory exists
        if (!is_dir($pluginDir)) {
            error_log("[Gateway] Plugin directory does not exist: {$pluginDir}");
            return false;
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
        
        // Generate title from key (e.g., social_post -> Social Post)
        $title = self::keyToTitle($collectionData['key']);
        
        // Convert fields array to formatted PHP array string
        $fieldsPhp = self::arrayToPhp($collectionData['fields']);
        
        // Replace placeholders
        $replacements = [
            '{{NAMESPACE}}' => $namespace,
            '{{CLASS_NAME}}' => $className,
            '{{COLLECTION_KEY}}' => $collectionData['key'],
            '{{COLLECTION_TITLE}}' => $title,
            '{{FIELDS_JSON}}' => $fieldsPhp,
        ];
        
        $classContent = str_replace(array_keys($replacements), array_values($replacements), $template);
        
        // Save to plugin root as collection.php
        $filePath = $pluginDir . '/collection.php';
        $result = file_put_contents($filePath, $classContent);
        
        if ($result === false) {
            error_log("[Gateway] Failed to write collection class to: {$filePath}");
            return false;
        }
        
        chmod($filePath, 0644);
        
        error_log("[Gateway] Generated collection class: {$filePath}");
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
        $indentStr = str_repeat('    ', $indent);
        $lines = ["["];
        
        foreach ($array as $item) {
            $itemLines = ["{$indentStr}["];
            foreach ($item as $key => $value) {
                $itemLines[] = "{$indentStr}    '{$key}' => '{$value}',";
            }
            $itemLines[] = "{$indentStr}],";
            $lines = array_merge($lines, $itemLines);
        }
        
        $lines[] = str_repeat('    ', $indent - 1) . "]";
        
        return implode("\n", $lines);
    }
}