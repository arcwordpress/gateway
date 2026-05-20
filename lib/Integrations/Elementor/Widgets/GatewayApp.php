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
            'description' => 'The key used when saving the app in Gateway Render.',
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

        $embed_path = GATEWAY_DATA_DIR . '/apps/' . $key . '/embed.js';
        $index_path = GATEWAY_DATA_DIR . '/apps/' . $key . '/index.html';

        if (!file_exists($embed_path)) {
            if (\Elementor\Plugin::$instance->editor->is_edit_mode()) {
                echo '<div style="padding:20px;border:1px dashed #555;color:#888;font-size:13px;">';
                echo 'Gateway App <code>' . esc_html($key) . '</code> not found — save it from Gateway &rsaquo; Render first.';
                echo '</div>';
            }
            return;
        }

        $container_id = 'gateway-app-' . esc_attr($key);
        $handle       = 'gateway-app-' . $key;
        $embed_url    = content_url('gateway/apps/' . $key . '/embed.js');
        $version      = md5_file($embed_path);

        // Inline the CSS from index.html so the app is styled when embedded
        $inline_css = $this->extractCss($index_path);
        if ($inline_css) {
            wp_register_style($handle . '-css', false);
            wp_enqueue_style($handle . '-css');
            wp_add_inline_style($handle . '-css', $inline_css);
        }

        wp_enqueue_script($handle, $embed_url, [], $version, true);

        add_filter('script_loader_tag', function ($tag, $h) use ($handle) {
            if ($h === $handle) {
                return str_replace('<script ', '<script type="module" ', $tag);
            }
            return $tag;
        }, 10, 2);

        printf(
            '<div id="%s" style="min-height:%dpx;"></div>',
            esc_attr($container_id),
            $min_height
        );
    }

    private function extractCss(string $index_path): string
    {
        if (!file_exists($index_path)) {
            return '';
        }
        $html = file_get_contents($index_path);
        if ($html === false) {
            return '';
        }
        if (preg_match('/<style>(.*?)<\/style>/is', $html, $m)) {
            return $m[1];
        }
        return '';
    }
}
