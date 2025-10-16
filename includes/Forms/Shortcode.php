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
        add_action('init', [__CLASS__, 'register_block']);
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

    /**
     * Register Gutenberg block for the shortcode
     */
    public static function register_block()
    {
        if (!function_exists('register_block_type')) {
            return;
        }

        register_block_type('arc-blueprint/form', [
            'api_version' => 2,
            'title' => 'Blueprint Form',
            'category' => 'widgets',
            'icon' => 'list-view',
            'description' => 'Display a Blueprint form',
            'supports' => [
                'html' => false,
            ],
            'attributes' => [
                'schema' => [
                    'type' => 'string',
                    'default' => '',
                ],
                'recordId' => [
                    'type' => 'string',
                    'default' => '',
                ],
                'className' => [
                    'type' => 'string',
                    'default' => '',
                ],
            ],
            'render_callback' => [__CLASS__, 'render_block'],
        ]);
    }

    /**
     * Render the Gutenberg block
     *
     * @param array $attributes Block attributes
     * @return string
     */
    public static function render_block($attributes)
    {
        $schema = !empty($attributes['schema']) ? $attributes['schema'] : '';
        $record_id = !empty($attributes['recordId']) ? $attributes['recordId'] : '';
        $class_name = !empty($attributes['className']) ? $attributes['className'] : '';

        // Convert to shortcode format
        $shortcode_atts = [
            'schema' => $schema,
        ];

        if (!empty($record_id)) {
            $shortcode_atts['record_id'] = $record_id;
        }

        if (!empty($class_name)) {
            $shortcode_atts['class'] = $class_name;
        }

        return self::render($shortcode_atts);
    }
}
