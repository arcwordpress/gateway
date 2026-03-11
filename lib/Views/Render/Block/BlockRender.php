<?php

namespace Gateway\Views\Render\Block;

class BlockRender extends \Gateway\Views\Render\Strategy
{
    public function __construct()
    {
        add_filter( 'gateway_view_render_block', [ $this, 'renderView' ], 10, 3 );
    }

    public function getType(): string
    {
        return 'block';
    }

    public function render(\Gateway\View $view, array $context = []): string
    {
        return (string) apply_filters('gateway_view_render_block', '', $view, $context);
    }

    /**
     * Default handler for the gateway_view_render_block filter.
     *
     * When a View's getRenderType() returns 'block', this renders the view
     * using the Gateway React grid app (gateway/react-view block pattern).
     * It outputs the data-gateway-grid mount point and enqueues the grid
     * app assets so the React app can initialise on the frontend.
     *
     * @param string           $output  Existing output (empty by default).
     * @param \Gateway\View    $view    The view being rendered.
     * @param array            $context Additional context passed by the caller.
     * @return string
     */
    public function renderView( string $output, \Gateway\View $view, array $context = [] ): string
    {
        // Allow other hooks to short-circuit with their own output.
        if ( '' !== $output ) {
            return $output;
        }

        $collection     = $view->getCollection();
        $collection_key = $collection ? $collection->getKey() : '';

        if ( empty( $collection_key ) ) {
            return '';
        }

        $this->enqueueGridApp();

        $show_filters = $context['showFilters'] ?? true;
        $config       = wp_json_encode( [
            'showFilters' => (bool) $show_filters,
        ] );

        return sprintf(
            '<div class="gateway-react-view" data-gateway-grid data-collection="%s" data-config="%s"></div>',
            esc_attr( $collection_key ),
            esc_attr( $config )
        );
    }

    /**
     * Enqueue the compiled React grid app assets.
     */
    private function enqueueGridApp(): void
    {
        $build_path = GATEWAY_PATH . 'react/apps/grid/build/';
        $build_url  = GATEWAY_URL  . 'react/apps/grid/build/';
        $asset_file = $build_path . 'index.asset.php';
        $asset      = file_exists( $asset_file )
            ? require $asset_file
            : [ 'dependencies' => [], 'version' => GATEWAY_VERSION ];

        if ( ! wp_script_is( 'gateway-grid-app', 'registered' ) ) {
            wp_register_script(
                'gateway-grid-app',
                $build_url . 'index.js',
                $asset['dependencies'],
                $asset['version'],
                true
            );
        }
        wp_enqueue_script( 'gateway-grid-app' );

        if ( file_exists( $build_path . 'style-index.css' ) && ! wp_style_is( 'gateway-grid-app-style', 'registered' ) ) {
            wp_register_style(
                'gateway-grid-app-style',
                $build_url . 'style-index.css',
                [],
                $asset['version']
            );
        }
        if ( wp_style_is( 'gateway-grid-app-style', 'registered' ) ) {
            wp_enqueue_style( 'gateway-grid-app-style' );
        }
    }
}
