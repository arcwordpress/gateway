<?php

namespace Gateway\Integrations\Gutenberg;

if (!defined('ABSPATH')) {
    exit;
}

class GutenbergController
{
    public static function init(): void
    {
        add_action('init',                       [__CLASS__, 'registerBlocks']);
        add_action('enqueue_block_editor_assets', [__CLASS__, 'enqueueEditorAssets']);
    }

    public static function registerBlocks(): void
    {
        BlockTypes\GridBlock::register();
    }

    public static function enqueueEditorAssets(): void
    {
        $path = GATEWAY_PATH . 'js/gateway-grid-block/editor.js';
        $url  = GATEWAY_URL  . 'js/gateway-grid-block/editor.js';

        if (!file_exists($path)) {
            return;
        }

        wp_enqueue_script(
            'gateway-grid-block-editor',
            $url,
            ['wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-i18n'],
            md5_file($path),
            true
        );
    }
}
