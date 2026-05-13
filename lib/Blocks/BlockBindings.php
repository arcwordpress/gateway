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
        // Register block binding sources after collections are registered
        // The 'gateway_loaded' action fires after core and extension collections
        // have been registered in the CollectionRegistry
        add_action('gateway_loaded', [self::class, 'registerBindingSources'], 20);

        // Add support for binding content attribute on gateway/bound-string block
        add_filter('block_bindings_supported_attributes_gateway/bound-string', [self::class, 'addBoundStringAttributes']);

        // Register block category for Gateway blocks
        add_filter('block_categories_all', [self::class, 'registerBlockCategory'], 10, 2);
    }

    /**
     * Register Gateway block category
     */
    public static function registerBlockCategory($categories, $post)
    {
        // Check if category already exists
        foreach ($categories as $category) {
            if ($category['slug'] === 'gateway') {
                return $categories;
            }
        }

        return array_merge(
            $categories,
            [
                [
                    'slug' => 'gateway',
                    'title' => __('Gateway', 'gateway'),
                    'icon' => 'database',
                ],
            ]
        );
    }

    /**
     * Add supported attributes for gateway/bound-string block
     *
     * @param array $supported_attributes Default supported attributes
     * @return array Extended supported attributes
     */
    public static function addBoundStringAttributes($supported_attributes)
    {
        // Add content attribute as bindable
        if (!in_array('content', $supported_attributes, true)) {
            $supported_attributes[] = 'content';
        }
        return $supported_attributes;
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
     * Sanitize a collection key for use in block binding source names
     *
     * Block binding source names must match /^[a-z0-9-]+\/[a-z0-9-]+$/
     * Only lowercase alphanumeric and dashes allowed - no underscores.
     *
     * @param string $key Collection key (e.g., 'wp_post', 'wp_term_taxonomy')
     * @return string Sanitized key (e.g., 'wp-post', 'wp-term-taxonomy')
     */
    public static function sanitizeSourceKey($key)
    {
        return str_replace('_', '-', strtolower($key));
    }

    /**
     * Register a block binding source for a specific collection
     *
     * @param string $key Collection key
     * @param \Gateway\Collection $collection Collection instance
     */
    protected static function registerCollectionBindingSource($key, $collection)
    {
        // Sanitize key: underscores not allowed in binding source names
        $sanitized_key = self::sanitizeSourceKey($key);
        $source_name = "gateway/{$sanitized_key}";

        if (\WP_Block_Bindings_Registry::get_instance()->is_registered($source_name)) {
            return;
        }

        $title = $collection->getTitle();

        register_block_bindings_source($source_name, [
            'label' => sprintf(__('Gateway: %s', 'gateway'), $title),
            'get_value_callback' => function ($source_args, $block_instance, $attribute_name) use ($collection, $sanitized_key) {
                return self::getBindingValue($collection, $sanitized_key, $source_args, $block_instance, $attribute_name);
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
            // Sanitize key: underscores not allowed in binding source names
            $sanitized_key = self::sanitizeSourceKey($key);
            $sources["gateway/{$sanitized_key}"] = [
                'label' => sprintf(__('Gateway: %s', 'gateway'), $collection->getTitle()),
                'collection_key' => $sanitized_key,
                'collection_class' => get_class($collection),
                'fields' => array_keys($collection->getFields()),
            ];
        }

        return $sources;
    }
}
