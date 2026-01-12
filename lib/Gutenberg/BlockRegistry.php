<?php

namespace Gateway\Gutenberg;

/**
 * Block Registry - Registers Core Gateway Block Types
 * 
 * This registry handles Gateway's internal blocks located in /react/blocks
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
     * Register all core blocks from /react/blocks directory
     */
    public static function register_blocks()
    {
        $blocks_dir = GATEWAY_PATH . 'react/blocks';
        
        if (!is_dir($blocks_dir)) {
            return;
        }
        
        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);
        
        foreach ($block_dirs as $block_path) {
            // Skip gt1 - it's for consumer block experiments, not core blocks
            if (basename($block_path) === 'gt1') {
                continue;
            }
            
            // Standard block registration
            if (file_exists($block_path . '/block.json')) {
                register_block_type($block_path);
            }
        }
    }
}