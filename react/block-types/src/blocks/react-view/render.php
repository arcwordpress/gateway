<?php
/**
 * Server-side rendering for gateway/react-view block.
 *
 * Outputs the mount point for the Gateway React view app and enqueues the
 * compiled view app assets.  The app's index.js auto-initialises by
 * scanning for [data-gateway-view] elements, reads data-view to get the
 * view key, and fetches view + collection data via the REST API.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner block content (unused – no inner blocks).
 * @var WP_Block $block      Block instance.
 */

$view_key     = $attributes['viewKey']     ?? '';
$show_filters = $attributes['showFilters'] ?? true;

// Show a helpful placeholder in the editor / preview if unconfigured.
if ( empty( $view_key ) ) {
    if ( current_user_can( 'edit_posts' ) ) {
        echo '<div class="wp-block-gateway-react-view wp-block-gateway-react-view--empty">'
            . '<p><em>' . esc_html__( 'React View: please select a view in the block settings.', 'gateway' ) . '</em></p>'
            . '</div>';
    }
    return;
}

// ---------------------------------------------------------------------------
// Enqueue the compiled view app assets
// ---------------------------------------------------------------------------

$build_path = GATEWAY_PATH . 'react/apps/grid/build/';
$build_url  = GATEWAY_URL  . 'react/apps/grid/build/';
$asset_file = $build_path . 'index.asset.php';
$asset      = file_exists( $asset_file )
    ? require $asset_file
    : [ 'dependencies' => [], 'version' => GATEWAY_VERSION ];

if ( ! wp_script_is( 'gateway-view-app', 'registered' ) ) {
    wp_register_script(
        'gateway-view-app',
        $build_url . 'index.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );
}
wp_enqueue_script( 'gateway-view-app' );

if ( file_exists( $build_path . 'style-index.css' ) && ! wp_style_is( 'gateway-view-app-style', 'registered' ) ) {
    wp_register_style(
        'gateway-view-app-style',
        $build_url . 'style-index.css',
        [],
        $asset['version']
    );
}
if ( wp_style_is( 'gateway-view-app-style', 'registered' ) ) {
    wp_enqueue_style( 'gateway-view-app-style' );
}

if ( file_exists( $build_path . 'index.css' ) && ! wp_style_is( 'gateway-view-app', 'registered' ) ) {
    wp_register_style(
        'gateway-view-app',
        $build_url . 'index.css',
        [],
        $asset['version']
    );
}
if ( wp_style_is( 'gateway-view-app', 'registered' ) ) {
    wp_enqueue_style( 'gateway-view-app' );
}

// ---------------------------------------------------------------------------
// Render the mount point
// ---------------------------------------------------------------------------

$config = wp_json_encode( [
    'showFilters' => (bool) $show_filters,
] );

$wrapper_attributes = get_block_wrapper_attributes( [
    'class'           => 'gateway-react-view',
    'data-gateway-view' => '',
    'data-view'       => esc_attr( $view_key ),
    'data-config'     => esc_attr( $config ),
] );

echo '<div ' . $wrapper_attributes . '></div>';
