<?php

namespace Gateway\Integrations\Gutenberg\BlockTypes;

if (!defined('ABSPATH')) {
    exit;
}

class GridBlock
{
    public static function register(): void
    {
        register_block_type(__DIR__ . '/block.json', [
            'render_callback' => [__CLASS__, 'render'],
        ]);
    }

    public static function render(array $attrs): string
    {
        $collection_key = sanitize_text_field($attrs['collection'] ?? '');

        if (empty($collection_key)) {
            return '<div class="gateway-grid-placeholder">Grid Display: select a collection in the block settings.</div>';
        }

        self::enqueueViewAssets();

        $enabled_views = array_values(array_filter([
            ($attrs['enableTableView'] ?? true) ? 'table' : null,
            ($attrs['enableListView']  ?? true) ? 'list'  : null,
            ($attrs['enableCardsView'] ?? true) ? 'cards' : null,
        ]));
        if (empty($enabled_views)) {
            $enabled_views = ['table'];
        }

        $default_view = in_array($attrs['defaultView'] ?? 'table', $enabled_views, true)
            ? ($attrs['defaultView'] ?? 'table')
            : $enabled_views[0];

        $action_roles = array_values(array_map('sanitize_key', (array) ($attrs['actionRoles'] ?? ['administrator'])));
        if (empty($action_roles)) {
            $action_roles = ['administrator'];
        }

        $resolve_roles = function (string $inherit_key, string $roles_key) use ($attrs, $action_roles): array {
            if ($attrs[$inherit_key] ?? true) {
                return $action_roles;
            }
            $roles = array_values(array_map('sanitize_key', (array) ($attrs[$roles_key] ?? ['administrator'])));
            return empty($roles) ? ['administrator'] : $roles;
        };

        $enable_actions = (bool) ($attrs['actionsEnabled'] ?? false);

        $config = wp_json_encode([
            'showFilters'         => (bool) ($attrs['showFilters']     ?? true),
            'showFacetToggle'     => (bool) ($attrs['showFacetToggle'] ?? true),
            'perPage'             => max(0, (int) ($attrs['perPage']    ?? 20)),
            'colorScheme'         => in_array($attrs['colorScheme'] ?? 'light', ['light', 'dark'], true)
                                        ? $attrs['colorScheme'] : 'light',
            'defaultView'         => $default_view,
            'enabledViews'        => $enabled_views,
            'hiddenFields'        => array_values(array_filter(array_map('sanitize_key', (array) ($attrs['hiddenFields'] ?? [])))),
            'recordViewMode'      => in_array($attrs['recordViewMode'] ?? 'modal', ['modal', 'link', 'disabled'], true)
                                        ? $attrs['recordViewMode'] : 'modal',
            'recordLinkPattern'   => sanitize_text_field($attrs['recordLinkPattern'] ?? ''),
            'actionsEnabled'      => $enable_actions,
            'actionRoles'         => $action_roles,
            'createActionEnabled' => $enable_actions && (bool) ($attrs['createActionEnabled'] ?? false),
            'createActionRoles'   => $resolve_roles('createRolesInherit', 'createActionRoles'),
            'updateActionEnabled' => $enable_actions && (bool) ($attrs['updateActionEnabled'] ?? false),
            'updateActionRoles'   => $resolve_roles('updateRolesInherit', 'updateActionRoles'),
            'deleteActionEnabled' => $enable_actions && (bool) ($attrs['deleteActionEnabled'] ?? false),
            'deleteActionRoles'   => $resolve_roles('deleteRolesInherit', 'deleteActionRoles'),
        ]);

        return sprintf(
            '<div data-gateway-grid="" data-schema="%s" data-config="%s"></div>',
            esc_attr($collection_key),
            esc_attr($config)
        );
    }

    private static function enqueueViewAssets(): void
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
            wp_register_script('gateway-grid', $buildUrl . 'index.js', [], $version, true);
            wp_localize_script('gateway-grid', 'gatewayBd', [
                'apiRoot'          => esc_url_raw(rest_url()),
                'siteUrl'          => esc_url_raw(site_url()),
                'currentUserId'    => get_current_user_id(),
                'currentUserRoles' => array_values((array) wp_get_current_user()->roles),
                'nonce'            => wp_create_nonce('wp_rest'),
            ]);
        }

        if (file_exists($cssPath) && !wp_style_is('gateway-grid', 'registered')) {
            wp_register_style('gateway-grid', $buildUrl . 'index.css', [], $version);
        }

        wp_enqueue_script('gateway-grid');
        wp_enqueue_style('gateway-grid');
    }
}
