<?php

namespace Gateway\Integrations\Gutenberg;

class RouterBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        $default_path = esc_attr( $attrs['defaultPath'] ?? '/' );
        $show_nav     = ! empty( $attrs['showNav'] );

        $nav = '';
        if ( $show_nav ) {
            $links = '';
            foreach ( $block->parsed_block['innerBlocks'] ?? [] as $inner ) {
                if ( $inner['blockName'] !== 'gateway/route' ) {
                    continue;
                }
                $path  = esc_attr( $inner['attrs']['path'] ?? '/' );
                $label = esc_html( $inner['attrs']['label'] ?? $path );
                $href  = '#' . ltrim( $path, '/' );
                $links .= sprintf(
                    '<a href="%s" class="gty-router-nav__link" data-gty-nav-link data-gty-path="%s">%s</a>',
                    esc_attr( $href ),
                    $path,
                    $label
                );
            }
            if ( $links ) {
                $nav = '<nav class="gty-router-nav">' . $links . '</nav>';
            }
        }

        return sprintf(
            '<div class="gty-router" data-gty-router data-gty-default-path="%s">%s%s</div>',
            $default_path,
            $nav,
            $content
        );
    }
}
