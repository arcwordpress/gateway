<?php

namespace Gateway;

/**
 * App Template Handler
 *
 * Handles the "Gateway App" page template and sets up rewrite rules
 * to support client-side routing for pages using this template.
 */
class AppTemplate
{
    /**
     * Template file name
     */
    const TEMPLATE_FILE = 'app-template.php';

    /**
     * Template slug/key
     */
    const TEMPLATE_SLUG = 'gateway-app-template';

    /**
     * Initialize the app template system
     */
    public static function init()
    {
        // Register the page template
        add_filter('theme_page_templates', [self::class, 'registerPageTemplate'], 10, 4);

        // Load the template file when selected
        add_filter('template_include', [self::class, 'loadTemplate']);

        // Add rewrite rules for app pages
        add_action('init', [self::class, 'addRewriteRules']);

        // Add query vars for route matching
        add_filter('query_vars', [self::class, 'addQueryVars']);

        // Flush rewrite rules on template assignment
        add_action('save_post', [self::class, 'maybeFlushRewrites'], 10, 3);

        // Register scheduled event for flushing rewrites
        add_action('gateway_flush_rewrites', [self::class, 'flushRewrites']);
    }

    /**
     * Register the Gateway App page template
     */
    public static function registerPageTemplate($templates, $theme, $post, $post_type)
    {
        if ($post_type === 'page') {
            $templates[self::TEMPLATE_SLUG] = __('Gateway App', 'gateway');
        }
        return $templates;
    }

    /**
     * Load the template file when a page uses the Gateway App template
     */
    public static function loadTemplate($template)
    {
        // Check if current page is using our template
        if (is_page() && get_page_template_slug() === self::TEMPLATE_SLUG) {
            $template_path = GATEWAY_PATH . 'templates/' . self::TEMPLATE_FILE;
            if (file_exists($template_path)) {
                return $template_path;
            }
        }
        return $template;
    }

    /**
     * Add rewrite rules to catch all sub-paths under app pages
     * This allows client-side routing to work when users navigate directly to routes
     */
    public static function addRewriteRules()
    {
        // Get all pages using the app template
        $app_pages = get_posts([
            'post_type' => 'page',
            'meta_key' => '_wp_page_template',
            'meta_value' => self::TEMPLATE_SLUG,
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);

        foreach ($app_pages as $page) {
            $page_slug = $page->post_name;

            // Add rewrite rule to catch all paths under this page
            // Example: if page is /my-app, this catches /my-app/anything/here
            // and redirects to the same page, letting client-side router handle it
            add_rewrite_rule(
                '^' . $page_slug . '(/.*)?/?$',
                'index.php?page_id=' . $page->ID . '&gateway_route=$matches[1]',
                'top'
            );
        }
    }

    /**
     * Add custom query vars for route matching
     */
    public static function addQueryVars($vars)
    {
        $vars[] = 'gateway_route';
        return $vars;
    }

    /**
     * Flush rewrite rules when a page's template is changed to/from app template
     */
    public static function maybeFlushRewrites($post_id, $post, $update)
    {
        // Only proceed for pages
        if ($post->post_type !== 'page') {
            return;
        }

        // Check if template was changed
        $old_template = get_post_meta($post_id, '_wp_page_template_before_update', true);
        $new_template = get_post_meta($post_id, '_wp_page_template', true);

        // If template changed to or from app template, flush rewrites
        if ($old_template === self::TEMPLATE_SLUG || $new_template === self::TEMPLATE_SLUG) {
            // Schedule flush (don't do it directly to avoid issues)
            if (!wp_next_scheduled('gateway_flush_rewrites')) {
                wp_schedule_single_event(time() + 5, 'gateway_flush_rewrites');
            }
        }

        // Store current template for next comparison
        update_post_meta($post_id, '_wp_page_template_before_update', $new_template);
    }

    /**
     * Flush rewrite rules
     * Called via scheduled event to avoid issues with immediate flushing
     */
    public static function flushRewrites()
    {
        flush_rewrite_rules();
    }
}
