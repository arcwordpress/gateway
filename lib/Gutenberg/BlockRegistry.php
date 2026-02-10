<?php

namespace Gateway\Gutenberg;

/**
 * Block Registry - Registers Core Gateway Block Types
 *
 * This registry handles Gateway's internal blocks located in:
 * - /react/block-types/blocks
 *
 * For consumer/developer blocks using the Block class system, see Gateway\Blocks\BlockRegistry
 *
 * @package Gateway
 */
class BlockRegistry
{

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
     * Register all core blocks from block directories
     */
    public static function register_blocks()
    {

        // Register blocks from new /react/block-types/build/blocks structure
        $block_types_dir = GATEWAY_PATH . 'react/block-types/build/blocks';
        if (is_dir($block_types_dir)) {
            $block_dirs = glob($block_types_dir . '/*', GLOB_ONLYDIR);

            foreach ($block_dirs as $block_path) {
                $block_name = basename($block_path);

                // Require both block.json and index.js to exist
                if (file_exists($block_path . '/block.json') &&
                    file_exists($block_path . '/index.js')) {
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