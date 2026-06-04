<?php

namespace Waypoint\Apps;

class DocController {

    public static function register() {
        $instance = new self();
        add_action('init',               [$instance, 'add_rewrite_rules']);
        add_filter('query_vars',         [$instance, 'add_query_vars']);
        add_filter('template_include',   [$instance, 'template_loader']);
        add_action('wp_enqueue_scripts', [$instance, 'enqueue_assets']);
    }

    public function add_rewrite_rules() {
        add_rewrite_rule('^docs(/.*)?/?$', 'index.php?waypoint_docs=$matches[1]', 'top');
        add_rewrite_tag('%waypoint_docs%', '(.*)');

        $rules = get_option('rewrite_rules');
        if (!isset($rules['^docs(/.*)?/?$'])) {
            flush_rewrite_rules(false);
        }
    }

    public function add_query_vars($vars) {
        $vars[] = 'waypoint_docs';
        return $vars;
    }

    public function template_loader($template) {
        if (false !== get_query_var('waypoint_docs', false)) {
            $custom = WAYPOINT_PATH . 'templates/docs.php';
            if (file_exists($custom)) {
                return $custom;
            }
        }
        return $template;
    }

    public function enqueue_assets() {
        if (false === get_query_var('waypoint_docs', false)) {
            return;
        }

        $build = WAYPOINT_PATH . 'apps/front/build/';

        if (!file_exists($build . 'index.js')) {
            return;
        }

        if (file_exists($build . 'index.css')) {
            wp_enqueue_style(
                'waypoint-front-css',
                WAYPOINT_URL . 'apps/front/build/index.css',
                [],
                filemtime($build . 'index.css')
            );
        }

        if (file_exists($build . 'style-index.css')) {
            wp_enqueue_style(
                'waypoint-front-component-css',
                WAYPOINT_URL . 'apps/front/build/style-index.css',
                [],
                filemtime($build . 'style-index.css')
            );
        }

        wp_enqueue_script(
            'waypoint-front',
            WAYPOINT_URL . 'apps/front/build/index.js',
            ['wp-element'],
            filemtime($build . 'index.js'),
            true
        );

        wp_localize_script('waypoint-front', 'waypointData', [
            'apiUrl'        => rest_url('gateway/v1'),
            'nonce'         => wp_create_nonce('wp_rest'),
            'isLoggedIn'    => is_user_logged_in(),
            'canManageDocs' => current_user_can('manage_options'),
            'adminUrl'      => admin_url('admin.php?page=gateway-collections'),
        ]);
    }

}
