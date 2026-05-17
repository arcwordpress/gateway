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

        $this->add_control('show_facet_toggle', [
            'label'        => 'Show Facet Toggle',
            'type'         => \Elementor\Controls_Manager::SWITCHER,
            'label_on'     => 'Yes',
            'label_off'    => 'No',
            'return_value' => 'yes',
            'default'      => 'yes',
            'condition'    => ['show_filters' => 'yes'],
        ]);

        $this->add_control('per_page', [
            'label'       => 'Per Page',
            'type'        => \Elementor\Controls_Manager::NUMBER,
            'default'     => 20,
            'min'         => 0,
            'max'         => 200,
            'description' => 'Set to 0 to show all records.',
        ]);

        $this->add_control('default_view', [
            'label'   => 'Default View',
            'type'    => \Elementor\Controls_Manager::SELECT,
            'options' => [
                'table' => 'Table',
                'list'  => 'List',
                'cards' => 'Cards',
            ],
            'default' => 'table',
        ]);

        $this->add_control('enable_table_view', [
            'label'        => 'Table View',
            'type'         => \Elementor\Controls_Manager::SWITCHER,
            'label_on'     => 'On',
            'label_off'    => 'Off',
            'return_value' => 'yes',
            'default'      => 'yes',
        ]);

        $this->add_control('enable_list_view', [
            'label'        => 'List View',
            'type'         => \Elementor\Controls_Manager::SWITCHER,
            'label_on'     => 'On',
            'label_off'    => 'Off',
            'return_value' => 'yes',
            'default'      => 'yes',
        ]);

        $this->add_control('enable_cards_view', [
            'label'        => 'Cards View',
            'type'         => \Elementor\Controls_Manager::SWITCHER,
            'label_on'     => 'On',
            'label_off'    => 'Off',
            'return_value' => 'yes',
            'default'      => 'yes',
        ]);

        $this->add_control('hidden_fields', [
            'label'   => 'Hidden Fields',
            'type'    => \Elementor\Controls_Manager::HIDDEN,
            'default' => '[]',
        ]);

        $this->end_controls_section();

        // ── Single Record View ─────────────────────────────────────────────

        $this->start_controls_section('record_view_section', [
            'label' => 'Single Record View',
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('record_view_mode', [
            'label'   => 'On Row Click',
            'type'    => \Elementor\Controls_Manager::SELECT,
            'options' => [
                'modal'    => 'Open Modal',
                'link'     => 'Link to Single Page',
                'disabled' => 'Disabled',
            ],
            'default' => 'modal',
        ]);

        $this->add_control('record_link_pattern', [
            'label'       => 'Link Pattern',
            'type'        => \Elementor\Controls_Manager::TEXT,
            'placeholder' => '/listings/{{record.id}}',
            'description' => 'Use {{record.field}} tokens — e.g. {{record.slug}} or {{record.id}}',
            'condition'   => ['record_view_mode' => 'link'],
        ]);

        $this->end_controls_section();

        // ── Actions ────────────────────────────────────────────────────────

        $this->start_controls_section('actions_section', [
            'label' => 'Actions',
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('enable_actions', [
            'label'        => 'Enable Actions',
            'type'         => \Elementor\Controls_Manager::SWITCHER,
            'label_on'     => 'Yes',
            'label_off'    => 'No',
            'return_value' => 'yes',
            'default'      => '',
            'description'  => 'Show an Actions column/area on each record row.',
        ]);

        $this->add_control('action_roles', [
            'label'       => 'Visible to Roles',
            'type'        => \Elementor\Controls_Manager::SELECT2,
            'multiple'    => true,
            'options'     => $this->getRoleOptions(),
            'default'     => ['administrator'],
            'description' => 'Actions are only shown to users with one of these roles.',
            'condition'   => ['enable_actions' => 'yes'],
        ]);

        $this->end_controls_section();

        $this->start_controls_section('style_section', [
            'label' => 'Style',
            'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
        ]);

        $this->add_control('color_scheme', [
            'label'   => 'Color Scheme',
            'type'    => \Elementor\Controls_Manager::SELECT,
            'options' => [
                'light' => 'Light',
                'dark'  => 'Dark',
            ],
            'default' => 'light',
        ]);

        $this->end_controls_section();
    }

    protected function render(): void
    {
        $settings       = $this->get_settings_for_display();
        $collection_key = sanitize_text_field($settings['collection'] ?? '');
        $show_filters       = ($settings['show_filters']     ?? 'yes') === 'yes';
        $show_facet_toggle  = ($settings['show_facet_toggle'] ?? 'yes') === 'yes';
        $per_page       = max(0, (int) ($settings['per_page'] ?? 20));
        $color_scheme   = in_array($settings['color_scheme'] ?? 'light', ['light', 'dark'], true)
                            ? $settings['color_scheme']
                            : 'light';

        $enabled_views  = array_values(array_filter([
            ($settings['enable_table_view'] ?? 'yes') === 'yes' ? 'table' : null,
            ($settings['enable_list_view']  ?? 'yes') === 'yes' ? 'list'  : null,
            ($settings['enable_cards_view'] ?? 'yes') === 'yes' ? 'cards' : null,
        ]));
        if (empty($enabled_views)) {
            $enabled_views = ['table'];
        }

        $default_view = in_array($settings['default_view'] ?? 'table', $enabled_views, true)
                            ? $settings['default_view']
                            : $enabled_views[0];

        $enable_actions = ($settings['enable_actions'] ?? '') === 'yes';
        $action_roles   = $settings['action_roles'] ?? ['administrator'];
        if (!is_array($action_roles) || empty($action_roles)) {
            $action_roles = ['administrator'];
        }
        $action_roles = array_values(array_map('sanitize_key', $action_roles));

        $record_view_mode    = in_array($settings['record_view_mode'] ?? 'modal', ['modal', 'link', 'disabled'], true)
                                ? $settings['record_view_mode']
                                : 'modal';
        $record_link_pattern = sanitize_text_field($settings['record_link_pattern'] ?? '');

        $hidden_fields_raw = $settings['hidden_fields'] ?? '[]';
        $hidden_fields     = json_decode($hidden_fields_raw, true);
        if (!is_array($hidden_fields)) {
            $hidden_fields = [];
        }
        $hidden_fields = array_values(array_filter(array_map('sanitize_key', $hidden_fields)));

        if (empty($collection_key)) {
            if (\Elementor\Plugin::$instance->editor->is_edit_mode()) {
                echo '<div class="gateway-grid-placeholder">Gateway Grid: select a collection in the panel.</div>';
                $this->renderCollectionList();
            }
            return;
        }

        $this->enqueuePreact();

        $config = wp_json_encode([
            'showFilters'       => $show_filters,
            'showFacetToggle'   => $show_facet_toggle,
            'perPage'           => $per_page,
            'colorScheme'       => $color_scheme,
            'defaultView'       => $default_view,
            'enabledViews'      => $enabled_views,
            'hiddenFields'      => $hidden_fields,
            'recordViewMode'    => $record_view_mode,
            'recordLinkPattern' => $record_link_pattern,
            'actionsEnabled'    => $enable_actions,
            'actionRoles'       => $action_roles,
        ]);

        echo '<div'
            . ' data-gateway-grid=""'
            . ' data-schema="'  . esc_attr($collection_key) . '"'
            . ' data-config="'  . esc_attr($config)          . '"'
            . '></div>';
    }

    private function enqueuePreact(): void
    {
        $build    = GATEWAY_PATH . 'js/gateway-grid/build/';
        $buildUrl = GATEWAY_URL  . 'js/gateway-grid/build/';

        $scriptPath = $build . 'index.js';
        $cssPath    = $build . 'index.css';

        if (!file_exists($scriptPath)) {
            return;
        }

        $version = md5_file($scriptPath);

        if (!wp_script_is('gateway-grid', 'registered')) {
            $current_user = wp_get_current_user();
            wp_register_script('gateway-grid', $buildUrl . 'index.js', [], $version, true);
            wp_localize_script('gateway-grid', 'gatewayBd', [
                'apiRoot'          => esc_url_raw(rest_url()),
                'siteUrl'          => esc_url_raw(site_url()),
                'currentUserId'    => get_current_user_id(),
                'currentUserRoles' => array_values((array) $current_user->roles),
            ]);
        }

        if (file_exists($cssPath) && !wp_style_is('gateway-grid', 'registered')) {
            wp_register_style('gateway-grid', $buildUrl . 'index.css', [], $version);
        }

        wp_enqueue_script('gateway-grid');
        wp_enqueue_style('gateway-grid');
    }

    private function getRoleOptions(): array
    {
        $roles   = wp_roles()->roles;
        $options = [];
        foreach ($roles as $role_key => $role_data) {
            $options[$role_key] = translate_user_role($role_data['name']);
        }
        return $options;
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
