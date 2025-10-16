<?php

namespace Gateway\Admin;

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
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_app']);
    }

    /**
     * Enqueue the React admin app
     */
    public static function enqueue_admin_app($hook)
    {
        // Only load on our admin page
        if ($hook !== 'toplevel_page_gateway') {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/admin/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/admin/build/';

        wp_enqueue_script(
            'gateway-admin',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'gateway-admin',
            $build_url . 'index.css',
            [],
            $asset['version']
        );
    }

    /**
     * Add admin menu
     */
    public static function add_admin_menu()
    {
        add_menu_page(
            'Gateway',
            'Gateway',
            'manage_options',
            'gateway',
            [__CLASS__, 'render_page'],
            'dashicons-admin-generic',
            30
        );
    }

    /**
     * Render the admin page
     */
    public static function render_page()
    {
        ?>
            <div id="gateway-admin-root"></div>

            <div style="margin: 20px; padding: 20px; background: #fff; border: 1px solid #ccc;">
                <h2>TestCollection - Create and Fetch Test</h2>

                <?php
                try {
                    $testCollection = new \Gateway\Test\TestCollection();

                    echo '<h3>Collection Information</h3>';
                    echo '<strong>Collection Class:</strong> ' . get_class($testCollection) . '<br>';
                    echo '<strong>Table Name:</strong> ' . $testCollection->getTable() . '<br>';
                    echo '<strong>Fillable Fields:</strong> ' . implode(', ', $testCollection->getFillable()) . '<br>';
                    echo '<strong>Route:</strong> ' . $testCollection->getRoute() . '<br>';
                    echo '<hr>';

                    echo '<h3>Test: Create a Record</h3>';
                    $newRecord = $testCollection->create([
                        'name' => 'Test Record ' . time(),
                        'description' => 'This is a test record created at ' . date('Y-m-d H:i:s'),
                        'status' => 'active',
                    ]);

                    if ($newRecord) {
                        echo '<span style="color: green;">✓ Record created successfully!</span><br>';
                        echo '<strong>ID:</strong> ' . $newRecord->id . '<br>';
                        echo '<strong>Name:</strong> ' . esc_html($newRecord->name) . '<br>';
                        echo '<strong>Description:</strong> ' . esc_html($newRecord->description) . '<br>';
                        echo '<strong>Status:</strong> ' . esc_html($newRecord->status) . '<br>';
                    } else {
                        echo '<span style="color: red;">✗ Failed to create record</span><br>';
                    }
                    echo '<hr>';

                    echo '<h3>Test: Fetch All Records</h3>';
                    $allRecords = $testCollection->all();
                    echo '<strong>Total Records:</strong> ' . count($allRecords) . '<br><br>';

                    if (count($allRecords) > 0) {
                        echo '<table style="width: 100%; border-collapse: collapse;">';
                        echo '<tr style="background: #f0f0f0;">';
                        echo '<th style="border: 1px solid #ccc; padding: 8px;">ID</th>';
                        echo '<th style="border: 1px solid #ccc; padding: 8px;">Name</th>';
                        echo '<th style="border: 1px solid #ccc; padding: 8px;">Description</th>';
                        echo '<th style="border: 1px solid #ccc; padding: 8px;">Status</th>';
                        echo '<th style="border: 1px solid #ccc; padding: 8px;">Created At</th>';
                        echo '</tr>';

                        foreach ($allRecords as $record) {
                            echo '<tr>';
                            echo '<td style="border: 1px solid #ccc; padding: 8px;">' . $record->id . '</td>';
                            echo '<td style="border: 1px solid #ccc; padding: 8px;">' . esc_html($record->name) . '</td>';
                            echo '<td style="border: 1px solid #ccc; padding: 8px;">' . esc_html($record->description) . '</td>';
                            echo '<td style="border: 1px solid #ccc; padding: 8px;">' . esc_html($record->status) . '</td>';
                            echo '<td style="border: 1px solid #ccc; padding: 8px;">' . $record->created_at . '</td>';
                            echo '</tr>';
                        }
                        echo '</table>';
                    } else {
                        echo '<span style="color: orange;">⚠ No records found</span><br>';
                    }

                } catch (\Exception $e) {
                    echo '<span style="color: red;">✗ Error: ' . esc_html($e->getMessage()) . '</span><br>';
                    echo '<pre>' . esc_html($e->getTraceAsString()) . '</pre>';
                }
                ?>
            </div>
        <?php
    }
}
