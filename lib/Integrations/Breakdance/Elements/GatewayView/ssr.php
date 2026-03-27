<?php
/**
 * Server-side render for the Gateway View Breakdance element.
 *
 * Breakdance calls this file when %%SSR%% appears in html.twig.
 * Available variables:
 *   $properties            - element properties set in the builder
 *   $parentPropertiesData  - parent element properties (unused here)
 */

if (!defined('ABSPATH')) {
    exit;
}

$view_key     = isset($properties['content']['view_key'])     ? sanitize_text_field((string) $properties['content']['view_key']) : '';
$show_filters = isset($properties['content']['show_filters']) ? (bool) $properties['content']['show_filters'] : true;

if (empty($view_key)) {
    echo '<p class="gateway-breakdance-view__placeholder">'
        . esc_html__('Gateway View: set a View Key in the element settings.', 'gateway')
        . '</p>';
    return;
}

// ---------------------------------------------------------------------------
// Enqueue the compiled grid/view app (same bundle as the Gutenberg block)
// ---------------------------------------------------------------------------

$build_path = GATEWAY_PATH . 'react/apps/grid/build/';
$build_url  = GATEWAY_URL  . 'react/apps/grid/build/';
$asset_file = $build_path . 'index.asset.php';
$asset      = file_exists($asset_file)
    ? require $asset_file
    : ['dependencies' => [], 'version' => GATEWAY_VERSION];

if (!wp_script_is('gateway-view-app', 'registered')) {
    wp_register_script(
        'gateway-view-app',
        $build_url . 'index.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );
}
wp_enqueue_script('gateway-view-app');

if (file_exists($build_path . 'style-index.css') && !wp_style_is('gateway-view-app-style', 'registered')) {
    wp_register_style(
        'gateway-view-app-style',
        $build_url . 'style-index.css',
        [],
        $asset['version']
    );
}
if (wp_style_is('gateway-view-app-style', 'registered')) {
    wp_enqueue_style('gateway-view-app-style');
}

if (file_exists($build_path . 'index.css') && !wp_style_is('gateway-view-app', 'registered')) {
    wp_register_style(
        'gateway-view-app',
        $build_url . 'index.css',
        [],
        $asset['version']
    );
}
if (wp_style_is('gateway-view-app', 'registered')) {
    wp_enqueue_style('gateway-view-app');
}

// ---------------------------------------------------------------------------
// Render the mount point — identical shape to the Gutenberg block render.php
// ---------------------------------------------------------------------------

$config = wp_json_encode(['showFilters' => $show_filters]);

echo '<div'
    . ' data-gateway-view=""'
    . ' data-view="'   . esc_attr($view_key) . '"'
    . ' data-config="' . esc_attr($config)   . '"'
    . '></div>';
