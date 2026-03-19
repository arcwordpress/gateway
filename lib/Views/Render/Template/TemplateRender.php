<?php

namespace Gateway\Views\Render\Template;

class TemplateRender extends \Gateway\Views\Render\Strategy
{
    public function getType(): string
    {
        return 'template';
    }

    public function render(\Gateway\View $view, array $context = []): string
    {
        return (string) apply_filters('gateway_view_render_template', '', $view, $context);
    }
}
