<?php

namespace Gateway\Integrations\Gutenberg;

class RouteBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        $path = esc_attr( $attrs['path'] ?? '/' );

        return sprintf(
            '<div class="gty-route" data-gty-route data-gty-path="%s">%s</div>',
            $path,
            $content
        );
    }
}
