<?php

namespace Gateway\Integrations\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

class Explorer extends \Elementor\Widget_Base
{
    public function get_name(): string
    {
        return 'gateway_explorer';
    }

    public function get_title(): string
    {
        return 'Gateway Explorer';
    }

    public function get_icon(): string
    {
        return 'eicon-search';
    }

    public function get_categories(): array
    {
        return ['general'];
    }

    public function get_keywords(): array
    {
        return ['gateway', 'explorer', 'collection', 'search', 'browse', 'data'];
    }

    protected function _register_controls(): void
    {
        $this->start_controls_section('content_section', [
            'label' => 'Explorer',
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('collection', [
            'label'       => 'Collection',
            'type'        => \Elementor\Controls_Manager::SELECT,
            'options'     => $this->getCollectionOptions(),
            'default'     => '',
            'description' => 'Select the Gateway collection to explore.',
        ]);

        $this->end_controls_section();
    }

    protected function render(): void
    {
        $settings       = $this->get_settings_for_display();
        $collection_key = sanitize_text_field($settings['collection'] ?? '');

        if (empty($collection_key)) {
            if (\Elementor\Plugin::$instance->editor->is_edit_mode()) {
                echo '<div class="gateway-explorer-placeholder">Gateway Explorer: select a collection in the panel.</div>';
                $this->renderCollectionList();
            }
            return;
        }

        echo '<div'
            . ' data-gateway-explorer=""'
            . ' data-schema="' . esc_attr($collection_key) . '"'
            . ' style="border:2px dashed #cbd5e1;border-radius:6px;padding:2rem;text-align:center;color:#64748b;font-family:sans-serif;">'
            . '<strong>Gateway Explorer</strong><br>'
            . '<span style="font-size:.875em;">Collection: <code>' . esc_html($collection_key) . '</code></span>'
            . '</div>';
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
                $title         = method_exists($collection, 'getTitle') ? $collection->getTitle() : $key;
                $options[$key] = $title . ' (' . $key . ')';
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
