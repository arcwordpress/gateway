<?php

namespace Gateway\Testing;

/**
 * Test Page Hook
 *
 * Intercepts specific test pages to render Gateway components for testing
 */
class TestPageHook
{
    /**
     * Initialize the test page hook
     */
    public static function init()
    {
        add_filter('the_content', [__CLASS__, 'intercept_test_pages']);
    }

    /**
     * Intercept test pages and inject Gateway components
     *
     * @param string $content The page content
     * @return string Modified content
     */
    public static function intercept_test_pages($content)
    {
        // Only run on singular pages
        if (!is_singular('page')) {
            return $content;
        }

        global $post;

        // Check if this is the test5 page
        if ($post->post_name === 'test5') {
            return self::render_test5_page();
        }

        return $content;
    }

    /**
     * Render the test5 page content
     * Testing: Filters App for tickets collection
     *
     * @return string
     */
    private static function render_test5_page()
    {
        ob_start();
        ?>
        <div class="gateway-test-page" style="padding: 2rem;">
            <h1>Gateway Test Page: Filters App</h1>
            <p style="margin-bottom: 2rem; color: #666;">Testing the Gateway Filters App with the "tickets" collection.</p>

            <div style="margin-bottom: 2rem; padding: 1rem; background: #f0f9ff; border-left: 4px solid #0284c7;">
                <strong>Test Info:</strong> This page is intercepted by the Gateway plugin to test the Filters App component.
            </div>

            <h2>Filters for "tickets" Collection:</h2>
            <?php \Gateway\Filters\Render::filters('tickets'); ?>
        </div>
        <?php
        return ob_get_clean();
    }
}
