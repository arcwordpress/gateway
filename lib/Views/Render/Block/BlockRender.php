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
     * Renders the view by producing a gateway/react-view block and passing it
     * through do_blocks().  The block's own render.php handles asset enqueueing
     * and mount-point output — we don't duplicate that logic here.
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

        $view_key = $view->getKey();

        if ( empty( $view_key ) ) {
            return '';
        }

        $show_filters = isset( $context['showFilters'] ) ? (bool) $context['showFilters'] : true;

        $block_markup = sprintf(
            '<!-- wp:gateway/react-view %s /-->',
            wp_json_encode( [
                'viewKey'     => $view_key,
                'showFilters' => $show_filters,
            ] )
        );

        return do_blocks( $block_markup );
    }
}
