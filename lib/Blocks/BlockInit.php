<?php

namespace Gateway\Blocks;

class BlockInit
{
    /**
     * Initialize all blocks and enqueue scripts
     */
    public static function init()
    {
        // Register internal/experimental blocks
        self::registerInternalBlocks();
        
        // Enqueue block editor assets (scripts and styles for block editing)
        add_action('enqueue_block_editor_assets', [self::class, 'enqueueBlockEditorAssets']);
        
        // Register all blocks programmatically
        add_action('init', [self::class, 'registerBlocks'], 10);
    }

    /**
     * Register internal/experimental blocks for testing
     */
    public static function registerInternalBlocks()
    {
        $registry = BlockRegistry::instance();
        
        // Register Box block
        BlockTypes\Box\Box::register();
        
        // Register Circle block
        BlockTypes\Circle\Circle::register();
    }

    /**
     * Enqueue block editor assets (scripts used for block editing)
     */
    public static function enqueueBlockEditorAssets()
    {
        // Enqueue the main gt1 blocks script for the editor
        wp_enqueue_script(
            'gateway-gt1-blocks',
            GATEWAY_URL . 'react/blocks/gt1/build/index.js',
            ['wp-blocks', 'wp-element', 'wp-server-side-render', 'wp-components', 'wp-editor'],
            filemtime(GATEWAY_PATH . 'react/blocks/gt1/build/index.js'),
            false
        );

        // Optional: Enqueue block editor styles if they exist
        $editor_css = GATEWAY_PATH . 'react/blocks/gt1/build/index.css';
        if (file_exists($editor_css)) {
            wp_enqueue_style(
                'gateway-gt1-blocks-editor',
                GATEWAY_URL . 'react/blocks/gt1/build/index.css',
                [],
                filemtime($editor_css)
            );
        }
    }

    /**
     * Register all blocks programmatically
     * Called on 'init' hook
     */
    public static function registerBlocks()
    {
        $registry = BlockRegistry::instance();
        
        // Iterate through all registered blocks and register them with WordPress
        foreach ($registry->getAll() as $block) {
            $name = $block->getName();
            
            // Register the block type with WordPress
            register_block_type($name, [
                'render_callback' => [$block, 'render'],
                // Editor script is handled globally via enqueueBlockEditorAssets
                'editor_script_handles' => ['gateway-gt1-blocks'],
            ]);
        }
    }
}
