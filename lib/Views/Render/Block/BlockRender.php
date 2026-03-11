<?php

namespace Gateway\Views\Render\Block;

class BlockRender extends \Gateway\Views\Render\Strategy
{
    public function getType(): string
    {
        return 'block';
    }

    public function render(\Gateway\View $view, array $context = []): string
    {
        return (string) apply_filters('gateway_view_render_block', '', $view, $context);
    }
}
