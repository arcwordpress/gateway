<?php

namespace Gateway\Views\Render\Shortcode;

class Shortcode
{
    public static function init(): void
    {
        add_shortcode('gateway_view', [__CLASS__, 'render']);
    }

    public static function render($atts): string
    {
        $atts = shortcode_atts([
            'key' => '',
        ], $atts);

        $key = isset($atts['key']) ? sanitize_text_field((string) $atts['key']) : '';

        if ($key === '') {
            return '<p>Error: View key is required</p>';
        }

        try {
            $view = \Gateway\Plugin::getInstance()->getViewRegistry()->get($key);
        } catch (\InvalidArgumentException $e) {
            return '<p>Error: View not found</p>';
        }

        return \Gateway\Views\Render\Controller::instance()->render($view, 'shortcode');
    }
}
