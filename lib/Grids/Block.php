<?php

namespace Gateway\Grids;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Draft dynamic block that wraps the existing grid shortcode renderer.
 */
class Block
{
    public static function init(): void
    {
        add_action('init', [__CLASS__, 'register']);
    }

    public static function register(): void
    {
        if (!function_exists('register_block_type')) {
            return;
        }

        register_block_type('gateway/grid', [
            'api_version' => 3,
            'title' => 'Gateway Grid',
            'description' => 'Render a Gateway grid for a registered collection.',
            'category' => 'widgets',
            'icon' => 'table-col-before',
            'keywords' => ['gateway', 'grid', 'collection'],
            'attributes' => [
                'schema' => [
                    'type' => 'string',
                    'default' => '',
                ],
                'showfilters' => [
                    'type' => 'boolean',
                    'default' => true,
                ],
                'colors' => [
                    'type' => 'string',
                    'default' => '',
                ],
                'className' => [
                    'type' => 'string',
                    'default' => '',
                ],
                'anchor' => [
                    'type' => 'string',
                    'default' => '',
                ],
            ],
            'render_callback' => [__CLASS__, 'render'],
            'supports' => [
                'anchor' => true,
                'customClassName' => true,
            ],
        ]);
    }

    /**
     * Render via the shortcode pipeline so all output/enqueue logic stays in one place.
     *
     * @param array<string,mixed> $attributes
     */
    public static function render(array $attributes): string
    {
        return Shortcode::render([
            'schema' => isset($attributes['schema']) ? (string) $attributes['schema'] : '',
            'showfilters' => !empty($attributes['showfilters']) ? 'true' : 'false',
            'colors' => isset($attributes['colors']) ? (string) $attributes['colors'] : '',
            'class' => isset($attributes['className']) ? (string) $attributes['className'] : '',
            'id' => isset($attributes['anchor']) ? (string) $attributes['anchor'] : '',
        ]);
    }
}
