<?php

namespace Gateway\Integrations\Gutenberg;

class LoopBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        $source = esc_attr( $attrs['dataSource'] ?? '' );
        return sprintf(
            '<div class="gty-loop" data-gty-loop data-gty-source="%s">%s</div>',
            $source,
            $content
        );
    }
}
