<?php

namespace Gateway;

/**
 * Client-Side Routing Handler
 *
 * Automatically detects pages with gateway/router blocks and sets up
 * rewrite rules to support client-side routing.
 */
class AppTemplate
{
    /**
     * Router block name
     */
    const ROUTER_BLOCK = 'gateway/router';

    /**
     * Initialize the routing system
     */
    public static function init()
    {
        // Add rewrite rules for pages with router blocks
        add_action('init', [self::class, 'addRewriteRules']);

        // Add query vars for route matching
        add_filter('query_vars', [self::class, 'addQueryVars']);

        // Flush rewrite rules when a page is saved/updated
        add_action('save_post', [self::class, 'maybeFlushRewrites'], 10, 3);

        // Register scheduled event for flushing rewrites
        add_action('gateway_flush_rewrites', [self::class, 'flushRewrites']);
    }

    /**
     * Check if a post/page contains the gateway/router block
     */
    public static function hasRouterBlock($post_id)
    {
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }

        // Use WordPress's has_block function to check for our router block
        return has_block(self::ROUTER_BLOCK, $post);
    }

    /**
     * Add rewrite rules to catch all sub-paths under app pages
     * This allows client-side routing to work when users navigate directly to routes
     */
    public static function addRewriteRules()
    {
        // Get all published pages
        $pages = get_posts([
            'post_type' => 'page',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        ]);

        // Find pages with router blocks
        foreach ($pages as $page) {
            // Check if this page contains a router block
            if (!self::hasRouterBlock($page->ID)) {
                continue;
            }

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
     * Flush rewrite rules when a page with router block is saved
     */
    public static function maybeFlushRewrites($post_id, $post, $update)
    {
        // Only proceed for pages
        if ($post->post_type !== 'page') {
            return;
        }

        // Check if this page has a router block now
        $has_router = self::hasRouterBlock($post_id);

        // Get previous state
        $had_router = get_post_meta($post_id, '_gateway_has_router', true);

        // If router block was added or removed, flush rewrites
        if ($has_router !== $had_router) {
            // Schedule flush (don't do it directly to avoid issues)
            if (!wp_next_scheduled('gateway_flush_rewrites')) {
                wp_schedule_single_event(time() + 5, 'gateway_flush_rewrites');
            }
        }

        // Store current state for next comparison
        update_post_meta($post_id, '_gateway_has_router', $has_router);
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
