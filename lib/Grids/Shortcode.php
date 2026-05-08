<?php

namespace Gateway\Grids;

class Shortcode
{
    public static function init(): void
    {
        add_shortcode('gateway_grid', [__CLASS__, 'render']);
    }

    public static function render($atts): string
    {
        $atts = shortcode_atts([
            'schema'      => '',
            'showfilters' => 'true',
            'class'       => '',
            'id'          => '',
        ], $atts);

        $schema = sanitize_text_field((string) $atts['schema']);

        if ($schema === '') {
            return '<p><strong>Gateway Grid Error:</strong> No schema specified.</p>';
        }

        $showFilters = filter_var($atts['showfilters'], FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';

        $config = wp_json_encode(['showFilters' => $showFilters === 'true']);

        $idAttr    = !empty($atts['id'])    ? ' id="' . esc_attr($atts['id']) . '"'       : '';
        $classAttr = !empty($atts['class']) ? ' class="' . esc_attr($atts['class']) . '"' : '';

        return sprintf(
            '<div data-gateway-grid data-schema="%s" data-config=\'%s\'%s%s></div>',
            esc_attr($schema),
            esc_attr($config),
            $idAttr,
            $classAttr
        );
    }
}
