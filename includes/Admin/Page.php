<?php

namespace Gateway\Admin;

use Gateway\Models\Test;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Page
{
    /**
     * Initialize the admin page
     */
    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
    }

    /**
     * Add admin menu
     */
    public static function add_admin_menu()
    {
        add_menu_page(
            'Gateway',           // Page title
            'Gateway',           // Menu title
            'manage_options',    // Capability
            'gateway',           // Menu slug
            [__CLASS__, 'render_page'], // Callback
            'dashicons-admin-generic',  // Icon
            30                   // Position
        );
    }

    /**
     * Render the admin page
     */
    public static function render_page()
    {
        ?>
        <div class="wrap">
            <h1>Gateway</h1>

            <div style="background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ccc;">
                <h2>Database Tests</h2>

                <?php
                try {
                    // Test 1: Count all records
                    $count = Test::count();
                    echo '<p><strong>Total Records:</strong> ' . esc_html($count) . '</p>';

                    // Test 2: Get all records
                    $tests = Test::all();
                    echo '<p><strong>All Records:</strong></p>';
                    if ($tests->count() > 0) {
                        echo '<ul>';
                        foreach ($tests as $test) {
                            echo '<li>ID: ' . esc_html($test->id) . ' | Name: ' . esc_html($test->name) . ' | Status: ' . esc_html($test->status) . '</li>';
                        }
                        echo '</ul>';
                    } else {
                        echo '<p><em>No records found.</em></p>';
                    }

                    // Test 3: Get latest record
                    $latest = Test::latest()->first();
                    if ($latest) {
                        echo '<p><strong>Latest Record:</strong> ' . esc_html($latest->name) . ' (ID: ' . esc_html($latest->id) . ')</p>';
                    } else {
                        echo '<p><strong>Latest Record:</strong> <em>None</em></p>';
                    }

                    // Test 4: Filter by status
                    $activeCount = Test::where('status', 'active')->count();
                    echo '<p><strong>Active Records:</strong> ' . esc_html($activeCount) . '</p>';

                } catch (\Exception $e) {
                    echo '<div class="notice notice-error"><p>Error: ' . esc_html($e->getMessage()) . '</p></div>';
                }
                ?>
            </div>
        </div>
        <?php
    }
}
