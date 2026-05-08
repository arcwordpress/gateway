<?php

namespace Gateway\Grids;

class Shortcode
{
    private static bool $scriptsEnqueued = false;

    public static function init(): void
    {
        add_shortcode('gateway_grid', [__CLASS__, 'render']);

        // Detect shortcode presence early so scripts land in <head>
        add_action('wp', [__CLASS__, 'maybeEnqueue']);
    }

    /**
     * Enqueue grid scripts when the current post/page contains the shortcode.
     */
    public static function maybeEnqueue(): void
    {
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'gateway_grid')) {
            self::enqueueScripts();
        }
    }

    public static function render($atts): string
    {
        $atts = shortcode_atts([
            'schema'      => '',
            'showfilters' => 'true',
            'colors'      => 'light',   // 'light' or 'dark'
            'class'       => '',
            'id'          => '',
        ], $atts);

        $schema = sanitize_text_field((string) $atts['schema']);

        if ($schema === '') {
            return '<p><strong>Gateway Grid Error:</strong> No schema specified.</p>';
        }

        // Fallback enqueue in case maybeEnqueue didn't fire (widget areas, etc.)
        self::enqueueScripts();

        $showFilters = filter_var($atts['showfilters'], FILTER_VALIDATE_BOOLEAN);
        $config      = wp_json_encode(['showFilters' => $showFilters]);

        $themeClass = $atts['colors'] === 'dark' ? '' : 'gtw-light';
        $classes    = trim($themeClass . ' ' . $atts['class']);

        $idAttr    = !empty($atts['id'])  ? ' id="' . esc_attr($atts['id']) . '"'       : '';
        $classAttr = $classes !== ''      ? ' class="' . esc_attr($classes) . '"'       : '';

        return sprintf(
            '<div data-gateway-grid data-schema="%s" data-config=\'%s\'%s%s></div>',
            esc_attr($schema),
            esc_attr($config),
            $idAttr,
            $classAttr
        );
    }

    private static function enqueueScripts(): void
    {
        if (self::$scriptsEnqueued) {
            return;
        }

        $assetFile = GATEWAY_PATH . 'react/apps/grid/build/index.asset.php';

        if (!file_exists($assetFile)) {
            return;
        }

        $asset    = require $assetFile;
        $buildUrl = GATEWAY_URL . 'react/apps/grid/build/';

        wp_enqueue_script(
            'gateway-grid',
            $buildUrl . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_localize_script('gateway-grid', 'wpApiSettings', [
            'root'  => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);

        // Design tokens — CSS custom properties used by all grid/component styles.
        // Not part of the webpack build; served directly as plain CSS.
        wp_enqueue_style(
            'gateway-tokens',
            GATEWAY_URL . 'react/packages/tokens.css',
            [],
            GATEWAY_VERSION
        );

        wp_enqueue_style(
            'gateway-grid-layout',
            $buildUrl . 'style-index.css',
            ['gateway-tokens'],
            $asset['version']
        );

        wp_enqueue_style(
            'gateway-grid',
            $buildUrl . 'index.css',
            ['gateway-grid-layout'],
            $asset['version']
        );

        self::$scriptsEnqueued = true;
    }
}
