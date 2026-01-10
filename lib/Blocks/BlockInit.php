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
        
        // Register Grid block
        BlockTypes\Grid\Grid::register();
    }

    /**
     * Enqueue block editor assets (scripts used for block editing)
     */
    public static function enqueueBlockEditorAssets()
    {
        // Load asset file for dependencies and version
        $asset_file = GATEWAY_PATH . 'react/blocks/gt1/build/index.asset.php';
        $asset = file_exists($asset_file) ? require $asset_file : ['dependencies' => [], 'version' => GATEWAY_VERSION];
        
        // Enqueue the main gt1 blocks script for the editor
        wp_enqueue_script(
            'gateway-gt1-blocks',
            GATEWAY_URL . 'react/blocks/gt1/build/index.js',
            $asset['dependencies'],
            $asset['version'],
            false
        );

        // Pass blocks metadata directly to the script to avoid timing issues
        $registry = BlockRegistry::instance();
        $blocks_data = array_values($registry->getMetadata());
        wp_localize_script('gateway-gt1-blocks', 'gatewayBlocks', $blocks_data);

        // Optional: Enqueue block editor styles if they exist
        $editor_css = GATEWAY_PATH . 'react/blocks/gt1/build/index.css';
        if (file_exists($editor_css)) {
            wp_enqueue_style(
                'gateway-gt1-blocks-editor',
                GATEWAY_URL . 'react/blocks/gt1/build/index.css',
                [],
                $asset['version']
            );
        }
    }

    /**
     * Register all blocks programmatically
     * Called on 'init' hook
     * 
     * Each block declares its registration type via getRegistrationType():
     * - 'json': Parse block.json and register with decoded metadata
     * - 'code': Register via code only (minimal metadata)
     * 
     * Blocks must not mix registration approaches.
     */
    public static function registerBlocks()
    {
        $registry = BlockRegistry::instance();
        
        foreach ($registry->getAll() as $block) {
            $name = $block->getName();
            $block_dir = $block->getBlockDir();
            $registration_type = $block::getRegistrationType();

            // Register based on the block's declared type
            if ($registration_type === 'json') {
                // Parse block.json and register with full metadata
                $block_json_path = $block_dir . '/block.json';
                if (file_exists($block_json_path)) {
                    $json_content = file_get_contents($block_json_path);
                    $json_data = json_decode($json_content, true);
                    
                    if (is_array($json_data)) {
                        // Merge in render callback
                        $json_data['render_callback'] = [$block, 'render'];
                        $json_data['editor_script_handles'] = ['gateway-gt1-blocks'];
                        register_block_type($name, $json_data);
                    } else {
                        error_log("Gateway Block - Invalid JSON in block.json for {$name}");
                    }
                } else {
                    error_log("Gateway Block - block.json not found for {$name} at {$block_json_path}");
                }
            } elseif ($registration_type === 'code') {
                // Pure code registration - get args from block
                $args = $block::getBlockArgs();
                $args['render_callback'] = [$block, 'render'];
                $args['editor_script_handles'] = ['gateway-gt1-blocks'];
                register_block_type($name, $args);
            } else {
                throw new \Exception(
                    "Invalid registration type '{$registration_type}' for block '{$name}'. " .
                    "Must be 'json' or 'code'."
                );
            }
        }
    }
}
