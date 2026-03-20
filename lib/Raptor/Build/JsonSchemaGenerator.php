<?php

namespace Gateway\Raptor\Build;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generates a JSON Schema (draft 2020-12) for a Raptor collection.
 *
 * Each collection field is mapped to an appropriate JSON Schema type/format.
 * The resulting schema is written to /schemas/{ClassName}.json inside the
 * generated plugin directory.
 */
class JsonSchemaGenerator
{
    /**
     * Generate a JSON schema array from normalised collection data.
     *
     * @param  array $collectionData  Keys: 'key', 'title', 'fields'
     * @return array                  Ready to json_encode()
     */
    public static function generateFromCollection(array $collectionData): array
    {
        $key    = $collectionData['key'] ?? '';
        $title  = $collectionData['title'] ?? self::keyToTitle($key);
        $fields = $collectionData['fields'] ?? [];

        $properties = new \stdClass();
        $required   = [];

        foreach ($fields as $field) {
            $name = $field['name'] ?? '';
            if (!$name) {
                continue;
            }

            $properties->$name = self::fieldToProperty($field);

            if (!empty($field['required'])) {
                $required[] = $name;
            }
        }

        $schema = [
            '$schema'    => 'https://json-schema.org/draft/2020-12/schema',
            '$id'        => 'gateway://collections/' . $key,
            'title'      => $title,
            'type'       => 'object',
            'properties' => $properties,
        ];

        if (!empty($required)) {
            $schema['required'] = $required;
        }

        return $schema;
    }

    /**
     * Generate the schema and write it to /schemas/{ClassName}.json in the plugin dir.
     *
     * @param  array  $collectionData  Normalised collection data
     * @param  string $pluginSlug      e.g. "my-extension"
     * @return array  { success, file? or error }
     */
    public static function generateAndWrite(array $collectionData, string $pluginSlug): array
    {
        $pluginDir  = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $schemasDir = $pluginDir . '/schemas';

        if (!is_dir($schemasDir) && !wp_mkdir_p($schemasDir)) {
            return ['success' => false, 'error' => 'Failed to create schemas directory.'];
        }

        $className = self::keyToClassName($collectionData['key'] ?? '');
        $filePath  = $schemasDir . '/' . $className . '.json';

        $schema = self::generateFromCollection($collectionData);
        $json   = json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        if (file_put_contents($filePath, $json) === false) {
            return ['success' => false, 'error' => 'Failed to write JSON schema file.'];
        }

        error_log("[Gateway] JsonSchemaGenerator: wrote {$filePath}");

        return ['success' => true, 'file' => $filePath];
    }

    // ─── Field type mapping ────────────────────────────────────────────────────

    private static function fieldToProperty(array $field): array
    {
        $type = $field['type'] ?? 'text';
        $prop = [];

        if (!empty($field['label'])) {
            $prop['title'] = $field['label'];
        }

        if (!empty($field['description'])) {
            $prop['description'] = $field['description'];
        }

        switch ($type) {
            case 'number':
                $prop['type'] = 'number';
                break;

            case 'checkbox':
                $prop['type'] = 'boolean';
                break;

            case 'date':
                $prop['type']   = 'string';
                $prop['format'] = 'date';
                break;

            case 'datetime':
                $prop['type']   = 'string';
                $prop['format'] = 'date-time';
                break;

            case 'email':
                $prop['type']   = 'string';
                $prop['format'] = 'email';
                break;

            case 'url':
                $prop['type']   = 'string';
                $prop['format'] = 'uri';
                break;

            case 'select':
                $prop['type'] = 'string';
                if (!empty($field['options']) && is_array($field['options'])) {
                    $values = array_filter(array_column($field['options'], 'value'), fn($v) => $v !== null && $v !== '');
                    if ($values) {
                        $prop['enum'] = array_values($values);
                    }
                }
                break;

            case 'repeater':
                $prop['type']  = 'array';
                $prop['items'] = ['type' => 'object'];
                break;

            case 'group':
                $prop['type'] = 'object';
                break;

            case 'textarea':
            case 'wysiwyg':
            case 'text':
            default:
                $prop['type'] = 'string';
                break;
        }

        if (array_key_exists('default', $field) && $field['default'] !== null) {
            $prop['default'] = $field['default'];
        }

        return $prop;
    }

    // ─── Naming helpers ────────────────────────────────────────────────────────

    private static function keyToClassName(string $key): string
    {
        return str_replace('_', '', ucwords($key, '_'));
    }

    private static function keyToTitle(string $key): string
    {
        return ucwords(str_replace('_', ' ', $key));
    }
}
