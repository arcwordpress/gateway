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

        // Register custom block categories
        add_filter('block_categories_all', [self::class, 'registerBlockCategories'], 10, 2);

    }

    /**
     * Register custom block categories
     */
    public static function registerBlockCategories($categories, $context)
    {

        // Build your custom categories in desired order
        $custom_cats = [
            [
                'slug'  => 'gateway',
                'title' => __( 'Gateway Standard (GTY)', 'gateway' ),
                'icon'  => 'database',
            ],
            [
                'slug'  => 'gateway-gtx',
                'title' => __( 'Gateway Interactive (GTX)', 'gateway' ),
                'icon'  => 'database',
            ],
            [
                'slug'  => 'gateway-gts',
                'title' => __( 'Gateway Dynamic (GTS)', 'gateway' ),
                'icon'  => 'database',
            ],
        ];

        // Merge customs at the beginning (top of inserter)
        return array_merge( $custom_cats, $categories );
        
    }

    /**
     * Register internal/experimental blocks for testing
     */
    public static function registerInternalBlocks()
    {

        $registry = BlockRegistry::instance();

        // Register Grid block
        BlockTypes\Grid\Grid::register();

        // Register GridItem block (used inside Grid)
        BlockTypes\GridItem\GridItem::register();
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

        // Enqueue block bindings sources registration (WordPress 6.7+)
        self::enqueueBlockBindingsSources();
    }

    /**
     * Enqueue block bindings sources for editor UI
     *
     * This registers Gateway collection-based binding sources with the
     * Block Editor, making them visible in the bindings UI panel.
     * Requires WordPress 6.7+ for full JS registration support.
     */
    protected static function enqueueBlockBindingsSources()
    {
        $bindings_asset_file = GATEWAY_PATH . 'js/block-bindings-sources/build/index.asset.php';

        if (!file_exists($bindings_asset_file)) {
            error_log('Gateway: block-bindings-sources asset file not found at ' . $bindings_asset_file);
            return;
        }

        $bindings_asset = require $bindings_asset_file;

        // Pass binding sources data to JavaScript BEFORE enqueuing
        $sources = BlockBindings::getAvailableSources();

        wp_enqueue_script(
            'gateway-block-bindings-sources',
            GATEWAY_URL . 'js/block-bindings-sources/build/index.js',
            $bindings_asset['dependencies'],
            $bindings_asset['version'],
            false
        );

        wp_localize_script('gateway-block-bindings-sources', 'gatewayBindingSources', $sources);
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
                        // Merge in central render callback (handles <InnerBlocks> replacement)
                        $json_data['render_callback'] = [$block, 'renderCallback'];
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
                // Use central render callback so templates don't need to manually
                // inject inner block content.
                $args['render_callback'] = [$block, 'renderCallback'];
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
