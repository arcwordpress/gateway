<?php

namespace Gateway\Integrations\Gutenberg;

class DataBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        // Data container — no HTML output; inner data-source blocks also return ''.
        return '';
    }
}
