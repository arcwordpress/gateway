<?php
/**
 * Server-side render for the Gateway Grid Breakdance element.
 *
 * Breakdance calls this file when %%SSR%% appears in html.twig.
 * Available variables:
 *   $properties            - element properties set in the builder
 *   $parentPropertiesData  - parent element properties (unused here)
 */

if (!defined('ABSPATH')) {
    exit;
}

$collection   = isset($properties['content']['collection'])   ? sanitize_text_field((string) $properties['content']['collection']) : '';
$show_filters = isset($properties['content']['show_filters']) ? (bool) $properties['content']['show_filters'] : true;
$per_page     = isset($properties['content']['per_page'])     ? max(1, (int) $properties['content']['per_page']) : 20;

if (empty($collection)) {
    echo '<p class="gateway-breakdance-grid__placeholder">'
        . esc_html__('Gateway Grid: enter a Collection key in the element settings.', 'gateway')
        . '</p>';
    return;
}

// ---------------------------------------------------------------------------
// Enqueue the Preact grid bundle (no WordPress React dependencies)
// ---------------------------------------------------------------------------

$script_path = GATEWAY_PATH . 'js/breakdance-grid/build/index.js';
$script_url  = GATEWAY_URL  . 'js/breakdance-grid/build/index.js';
$version     = file_exists($script_path) ? md5_file($script_path) : GATEWAY_VERSION;

if (!wp_script_is('gateway-bd-grid', 'registered')) {
    wp_register_script('gateway-bd-grid', $script_url, [], $version, true);

    wp_localize_script('gateway-bd-grid', 'gatewayBd', [
        'apiRoot' => esc_url_raw(rest_url()),
    ]);
}
wp_enqueue_script('gateway-bd-grid');

// ---------------------------------------------------------------------------
// Render the mount point
// ---------------------------------------------------------------------------

$config = wp_json_encode([
    'showFilters' => $show_filters,
    'perPage'     => $per_page,
]);

echo '<div'
    . ' data-gateway-grid=""'
    . ' data-schema="'  . esc_attr($collection) . '"'
    . ' data-config="'  . esc_attr($config)      . '"'
    . '></div>';
