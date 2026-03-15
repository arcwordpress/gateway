<?php

namespace Gateway\Views\Render\Page;

class PageRender extends \Gateway\Views\Render\Strategy
{
    public function getType(): string
    {
        return 'page';
    }

    public function render(\Gateway\View $view, array $context = []): string
    {
        return '<p>This view is registered as a standalone page. Visit the page to see the rendered output.</p>';
    }
}
