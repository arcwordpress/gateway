<?php

namespace Gateway\Collections;

/**
 * Interface Build - Parses collection blocks and generates collection data
 */
class InterfaceBuild
{
    /**
     * Parse collection blocks from post content
     * 
     * @param string $content Post content with Gutenberg blocks
     * @return array|null Collection data or null if invalid
     */
    public static function parseCollectionBlocks($content)
    {
        // Parse blocks from content
        $blocks = parse_blocks($content);
        
        // Find the collection-builder block
        $collectionBlock = self::findCollectionBuilder($blocks);
        
        if (!$collectionBlock) {
            return null;
        }
        
        // Extract collection key from attributes
        $collectionKey = isset($collectionBlock['attrs']['collectionKey']) 
            ? $collectionBlock['attrs']['collectionKey'] 
            : null;
            
        if (empty($collectionKey)) {
            return null;
        }
        
        // Find field-list block within collection-builder
        $fieldList = self::findFieldList($collectionBlock['innerBlocks']);
        
        if (!$fieldList) {
            return null;
        }
        
        // Extract fields from field-list
        $fields = self::extractFields($fieldList);
        
        // Find form-list block and extract forms
        $forms = self::extractForms($collectionBlock['innerBlocks']);
        
        return [
            'key' => $collectionKey,
            'fields' => $fields,
            'forms' => $forms
        ];
    }
    
    /**
     * Save collection data to JSON file in plugin directory
     * 
     * @param array $collectionData Collection data array
     * @param string $pluginSlug Plugin slug (e.g., 'horizon')
     * @return bool True on success, false on failure
     */
    public static function saveCollectionJson($collectionData, $pluginSlug = 'horizon')
    {
        if (empty($collectionData['key'])) {
            error_log('[Gateway] Collection key is missing, cannot save JSON');
            return false;
        }
        
        $pluginDir = WP_PLUGIN_DIR . '/' . $pluginSlug;
        
        // Ensure plugin directory exists
        if (!is_dir($pluginDir)) {
            error_log("[Gateway] Plugin directory does not exist: {$pluginDir}");
            return false;
        }
        
        $filename = $collectionData['key'] . '.json';
        $filePath = $pluginDir . '/' . $filename;
        
        // Convert to pretty JSON
        $json = json_encode($collectionData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        
        if ($json === false) {
            error_log('[Gateway] Failed to encode collection data to JSON');
            return false;
        }
        
        // Write to file
        $result = file_put_contents($filePath, $json);
        
        if ($result === false) {
            error_log("[Gateway] Failed to write collection JSON to: {$filePath}");
            return false;
        }
        
        chmod($filePath, 0644);
        
        return true;
    }
    
    /**
     * Find collection-builder block in parsed blocks
     * 
     * @param array $blocks Parsed blocks
     * @return array|null Collection builder block or null
     */
    private static function findCollectionBuilder($blocks)
    {
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'gateway/collection-builder') {
                return $block;
            }
        }
        return null;
    }
    
    /**
     * Find field-list block in inner blocks
     * 
     * @param array $blocks Inner blocks
     * @return array|null Field list block or null
     */
    private static function findFieldList($blocks)
    {
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'gateway/field-list') {
                return $block;
            }
        }
        return null;
    }
    
    /**
     * Extract fields from field-list block
     * 
     * @param array $fieldList Field list block
     * @return array Array of field data
     */
    private static function extractFields($fieldList)
    {
        $fields = [];
        
        // Check if fields are stored in attributes
        if (isset($fieldList['attrs']['fields']) && is_array($fieldList['attrs']['fields'])) {
            return $fieldList['attrs']['fields'];
        }
        
        // Otherwise, extract from inner blocks (field blocks)
        if (isset($fieldList['innerBlocks']) && is_array($fieldList['innerBlocks'])) {
            foreach ($fieldList['innerBlocks'] as $fieldBlock) {
                if ($fieldBlock['blockName'] === 'gateway/field') {
                    $fieldData = [
                        'type' => $fieldBlock['attrs']['type'] ?? 'text',
                        'name' => $fieldBlock['attrs']['name'] ?? '',
                        'label' => $fieldBlock['attrs']['label'] ?? '',
                    ];
                    
                    if (!empty($fieldData['name'])) {
                        $fields[] = $fieldData;
                    }
                }
            }
        }
        
        return $fields;
    }
    
    /**
     * Extract forms from form-list block
     * 
     * @param array $blocks Inner blocks
     * @return array Array of form data
     */
    private static function extractForms($blocks)
    {
        $forms = [];
        
        // Find form-list block
        $formList = null;
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'gateway/form-list') {
                $formList = $block;
                break;
            }
        }
        
        if (!$formList || empty($formList['innerBlocks'])) {
            return $forms;
        }
        
        // Extract each form2 block
        foreach ($formList['innerBlocks'] as $formBlock) {
            if ($formBlock['blockName'] === 'gateway/form2') {
                $formFields = self::extractFormFields($formBlock);
                $forms[] = [
                    'fields' => $formFields
                ];
            }
        }
        
        return $forms;
    }
    
    /**
     * Extract field references from a form block
     * 
     * @param array $formBlock Form2 block
     * @return array Array of field names referenced in the form
     */
    private static function extractFormFields($formBlock)
    {
        $fieldNames = [];
        
        if (empty($formBlock['innerBlocks'])) {
            return $fieldNames;
        }
        
        // Extract field-ref blocks
        foreach ($formBlock['innerBlocks'] as $innerBlock) {
            if ($innerBlock['blockName'] === 'gateway/field-ref') {
                $fieldName = $innerBlock['attrs']['name'] ?? '';
                if (!empty($fieldName)) {
                    $fieldNames[] = $fieldName;
                }
            }
        }
        
        return $fieldNames;
    }
}

