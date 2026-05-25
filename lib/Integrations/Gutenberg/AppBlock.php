<?php

namespace Gateway\Integrations\Gutenberg;

class AppBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        return sprintf( '<div class="gty-app">%s</div>', $content );
    }
}
