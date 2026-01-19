<?php

namespace Gateway\Blocks;

use Gateway\Plugin;

/**
 * Block Bindings integration for Gateway Collections
 *
 * Registers block binding sources for each collection in the registry,
 * allowing WordPress blocks to dynamically bind to collection data.
 */
class BlockBindings
{
    /**
     * Initialize block bindings
     */
    public static function init()
    {
        // Register block binding sources on init
        add_action('init', [self::class, 'registerBindingSources']);
    }

    /**
     * Register block binding sources for all collections
     */
    public static function registerBindingSources()
    {
        // Check if block bindings are supported (WordPress 6.5+)
        if (!function_exists('register_block_bindings_source')) {
            return;
        }

        $registry = Plugin::getInstance()->getRegistry();
        $collections = $registry->getAll();

        foreach ($collections as $key => $collection) {
            self::registerCollectionBindingSource($key, $collection);
        }
    }

    /**
     * Register a block binding source for a specific collection
     *
     * @param string $key Collection key
     * @param \Gateway\Collection $collection Collection instance
     */
    protected static function registerCollectionBindingSource($key, $collection)
    {
        $source_name = "gateway/{$key}";
        $title = $collection->getTitle();

        register_block_bindings_source($source_name, [
            'label' => sprintf(__('Gateway: %s', 'gateway'), $title),
            'get_value_callback' => function ($source_args, $block_instance, $attribute_name) use ($collection, $key) {
                return self::getBindingValue($collection, $key, $source_args, $block_instance, $attribute_name);
            },
            'uses_context' => ["{$source_name}/id", 'postId', 'postType'],
        ]);
    }

    /**
     * Get the value for a block binding
     *
     * @param \Gateway\Collection $collection Collection instance
     * @param string $key Collection key
     * @param array $source_args Binding source arguments
     * @param \WP_Block $block_instance Block instance
     * @param string $attribute_name Attribute name to bind
     * @return string|null The field value or null if not found
     */
    protected static function getBindingValue($collection, $key, $source_args, $block_instance, $attribute_name)
    {
        $record_id = null;
        $source_name = "gateway/{$key}";

        // Try to get record ID from various sources
        // 1. From block context (e.g., set by Query Loop or custom block)
        if (isset($block_instance->context["{$source_name}/id"])) {
            $record_id = $block_instance->context["{$source_name}/id"];
        }
        // 2. From source args (directly specified in binding)
        elseif (isset($source_args['id'])) {
            $record_id = $source_args['id'];
        }
        // 3. From post ID context (for post-type collections)
        elseif (isset($block_instance->context['postId'])) {
            $record_id = $block_instance->context['postId'];
        }

        if (!$record_id) {
            return null;
        }

        // Get the field name from source args or use attribute name
        $field_name = $source_args['field'] ?? $attribute_name;

        try {
            // Get the primary key name (default is 'id')
            $primary_key = $collection->getKeyName();

            // Fetch the record
            $record = $collection->where($primary_key, $record_id)->first();

            if (!$record) {
                return null;
            }

            // Return the field value
            if (isset($record->$field_name)) {
                return $record->$field_name;
            }

            return null;
        } catch (\Exception $e) {
            error_log("Gateway Block Bindings Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get all available binding sources
     * Useful for debugging or displaying available sources
     *
     * @return array Array of source names and their labels
     */
    public static function getAvailableSources()
    {
        $registry = Plugin::getInstance()->getRegistry();
        $collections = $registry->getAll();
        $sources = [];

        foreach ($collections as $key => $collection) {
            $sources["gateway/{$key}"] = [
                'label' => sprintf(__('Gateway: %s', 'gateway'), $collection->getTitle()),
                'collection_key' => $key,
                'collection_class' => get_class($collection),
                'fields' => array_keys($collection->getFields()),
            ];
        }

        return $sources;
    }
}
