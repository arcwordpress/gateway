<?php

namespace Gateway\Integrations\Gutenberg;

class DataSourceBlock
{
    public function render( array $attrs, string $content, $block ): string
    {
        // Data-only block — consumed by JS runtime, no HTML output.
        return '';
    }
}
