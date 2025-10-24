<?php

namespace Gateway\Forms;

class Shortcode
{
    /**
     * Initialize the shortcode
     */
    public static function init()
    {
        add_shortcode('blueprint_form', [__CLASS__, 'render']);
    }

    /**
     * Render the shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public static function render($atts)
    {
        $atts = shortcode_atts([
            'schema' => '',
            'record_id' => null,
            'class' => '',
            'id' => '',
        ], $atts);

        // Validate schema is provided
        if (empty($atts['schema'])) {
            return '<p><strong>Blueprint Form Error:</strong> No schema specified.</p>';
        }

        // Build attributes array
        $attributes = [];

        if (!empty($atts['class'])) {
            $attributes['class'] = $atts['class'];
        }

        if (!empty($atts['id'])) {
            $attributes['id'] = $atts['id'];
        }

        // Capture output
        ob_start();
        Render::form(
            $atts['schema'],
            !empty($atts['record_id']) ? intval($atts['record_id']) : null,
            $attributes
        );
        return ob_get_clean();
    }
}
