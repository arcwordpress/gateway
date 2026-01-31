<?php

namespace Gateway\Gutenberg;

/**
 * Block Registry - Registers Core Gateway Block Types
 *
 * This registry handles Gateway's internal blocks located in:
 * - /react/blocks (legacy React blocks)
 * - /react/block-types/blocks (new consolidated block types)
 * - /js/blocks (legacy JS/Interactivity blocks)
 *
 * For consumer/developer blocks using the Block class system, see Gateway\Blocks\BlockRegistry
 *
 * @package Gateway
 */
class BlockRegistry
{
    /**
     * Blocks to load from the new /react/block-types/blocks location.
     * Add block folder names here to test the new structure.
     * Once verified, the old block can be removed from /js/blocks.
     *
     * Example: ['bound-string', 'data-loop']
     */
    const NEW_BLOCK_TYPES = [
        // 'bound-string',  // Uncomment to test new location
        // 'data-loop',     // Uncomment to test new location
    ];

    /**
     * Initialize the block registry
     */
    public static function init()
    {
        add_action('init', [__CLASS__, 'register_blocks']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_interactivity_api']);
    }

    /**
     * Enqueue WordPress Interactivity API for frontend
     */
    public static function enqueue_interactivity_api()
    {
        // Enqueue the Interactivity API module for all blocks that use it
        wp_enqueue_script_module('@wordpress/interactivity');
    }

    /**
     * Get list of blocks to load from the new block-types location.
     * Can be filtered to enable testing without code changes.
     *
     * @return array Block folder names to load from new location.
     */
    public static function get_new_block_types()
    {
        return apply_filters('gateway_new_block_types', self::NEW_BLOCK_TYPES);
    }

    /**
     * Register all core blocks from block directories
     */
    public static function register_blocks()
    {
        $new_block_types = self::get_new_block_types();

        // Register blocks from new /react/block-types/blocks structure
        $block_types_dir = GATEWAY_PATH . 'react/block-types/blocks';
        if (is_dir($block_types_dir)) {
            $block_dirs = glob($block_types_dir . '/*', GLOB_ONLYDIR);

            foreach ($block_dirs as $block_path) {
                $block_name = basename($block_path);

                // Only register if block is in the new_block_types list
                if (!in_array($block_name, $new_block_types, true)) {
                    continue;
                }

                // Require both block.json and build/index.js to exist
                if (file_exists($block_path . '/block.json') &&
                    file_exists($block_path . '/build/index.js')) {
                    register_block_type($block_path);
                }
            }
        }

        // Register React blocks from /react/blocks
        $react_blocks_dir = GATEWAY_PATH . 'react/blocks';
        if (is_dir($react_blocks_dir)) {
            $block_dirs = glob($react_blocks_dir . '/*', GLOB_ONLYDIR);

            foreach ($block_dirs as $block_path) {
                // Standard block registration
                if (file_exists($block_path . '/block.json')) {
                    register_block_type($block_path);
                }
            }
        }

        // Register interactive blocks from /js/blocks (using Interactivity API)
        $js_blocks_dir = GATEWAY_PATH . 'js/blocks';
        if (is_dir($js_blocks_dir)) {
            $block_dirs = glob($js_blocks_dir . '/*', GLOB_ONLYDIR);

            foreach ($block_dirs as $block_path) {
                $block_name = basename($block_path);

                // Skip if this block is being loaded from the new location
                if (in_array($block_name, $new_block_types, true)) {
                    continue;
                }

                // Standard block registration
                if (file_exists($block_path . '/block.json')) {
                    register_block_type($block_path);
                }
            }
        }

        // Add bindable attributes support for gateway/gts-bound-string
        add_filter('block_bindings_supported_attributes_gateway/gts-bound-string', function($attributes) {
            return array_merge($attributes, ['content']);
        });
    }
}