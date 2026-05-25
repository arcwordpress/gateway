<?php

namespace Gateway\Integrations\Gutenberg;

class DataBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        // Shell — outputs nothing on the front end until data loading is implemented.
        return '';
    }
}
