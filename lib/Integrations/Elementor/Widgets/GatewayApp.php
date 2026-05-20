<?php

namespace Gateway\Integrations\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

class GatewayApp extends \Elementor\Widget_Base
{
    public function get_name(): string
    {
        return 'gateway_app';
    }

    public function get_title(): string
    {
        return 'Gateway App';
    }

    public function get_icon(): string
    {
        return 'eicon-code';
    }

    public function get_categories(): array
    {
        return ['general'];
    }

    public function get_keywords(): array
    {
        return ['gateway', 'app', 'preact', 'render'];
    }

    protected function _register_controls(): void
    {
        $this->start_controls_section('content_section', [
            'label' => 'App',
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('app_key', [
            'label'       => 'App Key',
            'type'        => \Elementor\Controls_Manager::TEXT,
            'default'     => 'test1',
            'description' => 'The key used when saving the app in Gateway › Render.',
        ]);

        $this->add_control('min_height', [
            'label'   => 'Min Height (px)',
            'type'    => \Elementor\Controls_Manager::NUMBER,
            'default' => 400,
            'min'     => 100,
        ]);

        $this->end_controls_section();
    }

    protected function render(): void
    {
        $settings   = $this->get_settings_for_display();
        $key        = sanitize_key($settings['app_key'] ?? 'test1');
        $min_height = absint($settings['min_height'] ?? 400);

        $app_dir    = GATEWAY_DATA_DIR . '/apps/' . $key;
        $embed_path = $app_dir . '/embed.js';

        if (!file_exists($embed_path)) {
            printf(
                '<div style="padding:20px;border:1px dashed #555;color:#888;font-size:13px;font-family:system-ui,sans-serif;">'
                . 'Gateway App <code>%s</code> not found — save it from Gateway &rsaquo; Render first.'
                . '</div>',
                esc_html($key)
            );
            return;
        }

        $base_url  = content_url('gateway/apps/' . $key . '/');
        $js_ver    = substr(md5_file($embed_path), 0, 8);

        // Output <link> and <script type="module"> inline rather than via
        // wp_enqueue_script, because wp_footer never fires inside Elementor's
        // preview iframe — inline tags are the only reliable way to load assets
        // in both the editor preview and the live frontend.
        // Static array deduplicates when the same key appears more than once.
        static $printed = [];

        if (!isset($printed[$key])) {
            $printed[$key] = true;

            $css_path = $app_dir . '/embed.css';
            if (file_exists($css_path)) {
                $css_ver = substr(md5_file($css_path), 0, 8);
                printf(
                    '<link rel="stylesheet" href="%s">',
                    esc_url($base_url . 'embed.css?v=' . $css_ver)
                );
            }

            printf(
                '<script type="module" src="%s"></script>',
                esc_url($base_url . 'embed.js?v=' . $js_ver)
            );
        }

        printf(
            '<div id="gateway-app-%s" style="min-height:%dpx;"></div>',
            esc_attr($key),
            $min_height
        );
    }
}
