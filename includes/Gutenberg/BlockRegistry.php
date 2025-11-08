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
     * List of available blocks
     *
     * @var array
     */
    private static $available_blocks = [
        'grid' => [
            'enabled' => true,
            'path' => 'react/blocks/grid',
        ],
        'form' => [
            'enabled' => true,
            'path' => 'react/blocks/form',
        ],
        'field-blocks' => [
            'enabled' => true,
            'path' => 'react/blocks/field-blocks',
            'type' => 'script-only', // Registers multiple blocks via JS
        ],
    ];

    /**
     * Initialize the block registry
     */
    public static function init()
    {
        add_action('init', [__CLASS__, 'register_blocks']);
        add_action('enqueue_block_assets', [__CLASS__, 'enqueue_block_assets']);
    }

    /**
     * Enqueue Block Assets (CSS) in both editor and frontend
     * Using enqueue_block_assets ensures CSS reaches the editor iframe
     */
    public static function enqueue_block_assets()
    {
        // Enqueue Grid CSS
        $grid_css_path = GATEWAY_PATH . 'react/apps/grid/build/index.css';
        $grid_css_url = GATEWAY_URL . 'react/apps/grid/build/index.css';

        if (file_exists($grid_css_path)) {
            wp_enqueue_style(
                'gateway-grid-styles',
                $grid_css_url,
                [],
                filemtime($grid_css_path)
            );
        }

        // Enqueue Form CSS
        $form_css_path = GATEWAY_PATH . 'react/apps/form/build/index.css';
        $form_css_url = GATEWAY_URL . 'react/apps/form/build/index.css';

        if (file_exists($form_css_path)) {
            wp_enqueue_style(
                'gateway-form-styles',
                $form_css_url,
                [],
                filemtime($form_css_path)
            );
        }

        // Enqueue Field Blocks CSS
        $field_blocks_css_path = GATEWAY_PATH . 'react/blocks/field-blocks/build/index.css';
        $field_blocks_css_url = GATEWAY_URL . 'react/blocks/field-blocks/build/index.css';

        if (file_exists($field_blocks_css_path)) {
            wp_enqueue_style(
                'gateway-field-blocks-styles',
                $field_blocks_css_url,
                [],
                filemtime($field_blocks_css_path)
            );
        }
    }

    /**
     * Register all enabled blocks
     */
    public static function register_blocks()
    {
        foreach (self::$available_blocks as $block_name => $config) {
            // Skip if block is disabled
            if (!self::is_block_enabled($block_name)) {
                continue;
            }

            self::register_block($block_name, $config);
        }
    }

    /**
     * Register a single block
     *
     * @param string $block_name The block name (e.g., 'grid')
     * @param array  $config     Block configuration
     */
    private static function register_block($block_name, $config)
    {
        $block_path = GATEWAY_PATH . $config['path'];
        $block_type_mode = $config['type'] ?? 'block-json';

        // Handle script-only blocks (like field-blocks factory)
        if ($block_type_mode === 'script-only') {
            self::register_script_only_block($block_name, $block_path);
            return;
        }

        // Check if block.json exists
        if (!file_exists($block_path . '/block.json')) {
            return;
        }

        // Register the block with render callback
        $block_type = register_block_type($block_path, [
            'render_callback' => function($attributes, $content, $block) use ($block_path) {
                // Include the render.php file
                $render_file = $block_path . '/render.php';
                if (file_exists($render_file)) {
                    ob_start();
                    include $render_file;
                    return ob_get_clean();
                }
                return '';
            }
        ]);

        // Add wpApiSettings to the editor script
        if ($block_type && !empty($block_type->editor_script)) {
            add_action('enqueue_block_editor_assets', function() use ($block_type) {
                wp_localize_script($block_type->editor_script, 'wpApiSettings', [
                    'root' => esc_url_raw(rest_url()),
                    'nonce' => wp_create_nonce('wp_rest'),
                ]);
            });
        }
    }

    /**
     * Register a script-only block (registers multiple blocks via JavaScript)
     *
     * @param string $block_name The block name
     * @param string $block_path The block path
     */
    private static function register_script_only_block($block_name, $block_path)
    {
        $script_path = $block_path . '/build/index.js';
        $script_url = GATEWAY_URL . str_replace(GATEWAY_PATH, '', $block_path) . '/build/index.js';
        $asset_file = $block_path . '/build/index.asset.php';

        if (!file_exists($script_path)) {
            return;
        }

        // Load asset file for dependencies
        $asset = file_exists($asset_file) ? include $asset_file : ['dependencies' => [], 'version' => '1.0.0'];

        // Enqueue the editor script
        add_action('enqueue_block_editor_assets', function() use ($block_name, $script_url, $asset) {
            wp_enqueue_script(
                'gateway-' . $block_name,
                $script_url,
                $asset['dependencies'],
                $asset['version'],
                true
            );

            wp_localize_script('gateway-' . $block_name, 'wpApiSettings', [
                'root' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest'),
            ]);
        });
    }

    /**
     * Check if a block is enabled
     *
     * @param string $block_name The block name
     * @return bool
     */
    public static function is_block_enabled($block_name)
    {
        if (!isset(self::$available_blocks[$block_name])) {
            return false;
        }

        $config = self::$available_blocks[$block_name];

        // Check if explicitly disabled in config
        if (isset($config['enabled']) && !$config['enabled']) {
            return false;
        }

        // Apply filter to allow programmatic control
        return apply_filters('gateway_block_enabled', $config['enabled'], $block_name);
    }

    /**
     * Enable a block
     *
     * @param string $block_name The block name
     */
    public static function enable_block($block_name)
    {
        if (isset(self::$available_blocks[$block_name])) {
            self::$available_blocks[$block_name]['enabled'] = true;
        }
    }

    /**
     * Disable a block
     *
     * @param string $block_name The block name
     */
    public static function disable_block($block_name)
    {
        if (isset(self::$available_blocks[$block_name])) {
            self::$available_blocks[$block_name]['enabled'] = false;
        }
    }

    /**
     * Get all available blocks
     *
     * @return array
     */
    public static function get_available_blocks()
    {
        return self::$available_blocks;
    }
}
