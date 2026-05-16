<?php

namespace Gateway\Integrations\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

class Grid extends \Elementor\Widget_Base
{
    public function get_name(): string
    {
        return 'gateway_grid';
    }

    public function get_title(): string
    {
        return 'Gateway Grid';
    }

    public function get_icon(): string
    {
        return 'eicon-table';
    }

    public function get_categories(): array
    {
        return ['general'];
    }

    public function get_keywords(): array
    {
        return ['gateway', 'grid', 'collection', 'table', 'data'];
    }

    protected function _register_controls(): void
    {
        $this->start_controls_section('content_section', [
            'label' => 'Gateway Grid',
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('collection', [
            'label'       => 'Collection',
            'type'        => \Elementor\Controls_Manager::SELECT,
            'options'     => $this->getCollectionOptions(),
            'default'     => '',
            'description' => 'Select the Gateway collection to display.',
        ]);

        $this->add_control('show_filters', [
            'label'        => 'Show Facets',
            'type'         => \Elementor\Controls_Manager::SWITCHER,
            'label_on'     => 'Yes',
            'label_off'    => 'No',
            'return_value' => 'yes',
            'default'      => 'yes',
        ]);

        $this->add_control('per_page', [
            'label'   => 'Per Page',
            'type'    => \Elementor\Controls_Manager::NUMBER,
            'default' => 20,
            'min'     => 1,
            'max'     => 200,
        ]);

        $this->end_controls_section();
    }

    protected function render(): void
    {
        $settings       = $this->get_settings_for_display();
        $collection_key = sanitize_text_field($settings['collection'] ?? '');
        $show_filters   = ($settings['show_filters'] ?? 'yes') === 'yes';
        $per_page       = max(1, (int) ($settings['per_page'] ?? 20));

        if (empty($collection_key)) {
            if (\Elementor\Plugin::$instance->editor->is_edit_mode()) {
                echo '<div class="gateway-grid-placeholder">Gateway Grid: select a collection in the panel.</div>';
                $this->renderCollectionList();
            }
            return;
        }

        $this->enqueuePreact();

        $config = wp_json_encode([
            'showFilters' => $show_filters,
            'perPage'     => $per_page,
        ]);

        echo '<div'
            . ' data-gateway-grid=""'
            . ' data-schema="'  . esc_attr($collection_key) . '"'
            . ' data-config="'  . esc_attr($config)          . '"'
            . '></div>';
    }

    private function enqueuePreact(): void
    {
        $script_path = GATEWAY_PATH . 'js/gateway-grid/build/index.js';
        $script_url  = GATEWAY_URL  . 'js/gateway-grid/build/index.js';

        if (!file_exists($script_path)) {
            return;
        }

        $version = md5_file($script_path);

        if (!wp_script_is('gateway-grid', 'registered')) {
            wp_register_script('gateway-grid', $script_url, [], $version, true);
            wp_localize_script('gateway-grid', 'gatewayBd', [
                'apiRoot' => esc_url_raw(rest_url()),
            ]);
        }

        wp_enqueue_script('gateway-grid');
    }

    private function getCollectionOptions(): array
    {
        $options = ['' => '— Select a collection —'];

        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if (!$registry) return $options;

            foreach ($registry->getAll() as $key => $collection) {
                if (method_exists($collection, 'isHidden') && $collection->isHidden()) {
                    continue;
                }
                $title          = method_exists($collection, 'getTitle') ? $collection->getTitle() : $key;
                $options[$key]  = $title . ' (' . $key . ')';
            }
        } catch (\Throwable $e) {
            // Registry not ready — return blank options
        }

        return $options;
    }

    private function renderCollectionList(): void
    {
        try {
            $registry    = \Gateway\Plugin::getInstance()->getRegistry();
            $collections = $registry ? $registry->getAll() : [];
            $visible     = array_filter($collections, fn($c) => !method_exists($c, 'isHidden') || !$c->isHidden());
        } catch (\Throwable $e) {
            $visible = [];
        }

        if (empty($visible)) return;

        echo '<ul style="margin:.5em 0 0;padding-left:1.2em;font-size:.85em;opacity:.7">';
        foreach ($visible as $key => $col) {
            $title = method_exists($col, 'getTitle') ? $col->getTitle() : $key;
            echo '<li><code>' . esc_html($key) . '</code> — ' . esc_html($title) . '</li>';
        }
        echo '</ul>';
    }
}
