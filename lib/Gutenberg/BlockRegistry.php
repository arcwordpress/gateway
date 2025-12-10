<?php

namespace Gateway\Gutenberg;

/**
 * Block Registry - Registers and manages Gutenberg blocks
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
    }

    /**
     * Register all blocks from /react/blocks directory
     */
    public static function register_blocks()
    {
        $blocks_dir = GATEWAY_PATH . 'react/blocks';
        
        // Check if blocks directory exists
        if (!is_dir($blocks_dir)) {
            return;
        }
        
        // Get all subdirectories in blocks folder
        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);
        
        foreach ($block_dirs as $block_path) {
            // Check if block.json exists
            if (file_exists($block_path . '/block.json')) {
                error_log('registered-block-type: '.$block_path);
                register_block_type($block_path);
            }
        }
    }
}
