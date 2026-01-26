<?php
/**
 * Plugin Name: Gateway Block Bindings Test
 * Description: Visual test page for Gateway block binding data sources
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Author: Gateway
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Gateway Block Bindings Test Plugin
 *
 * This example plugin creates an admin page that visually tests
 * the automatic block binding data sources created by Gateway collections.
 */
class Gateway_Bindings_Test {

    /**
     * Initialize the plugin
     */
    public static function init() {
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_styles']);
    }

    /**
     * Add admin menu page
     */
    public static function add_admin_menu() {
        add_management_page(
            'Block Bindings Test',
            'Bindings Test',
            'manage_options',
            'gateway-bindings-test',
            [__CLASS__, 'render_admin_page']
        );
    }

    /**
     * Enqueue admin styles
     */
    public static function enqueue_styles($hook) {
        if ($hook !== 'tools_page_gateway-bindings-test') {
            return;
        }

        wp_add_inline_style('common', self::get_inline_styles());
    }

    /**
     * Get inline CSS styles
     */
    private static function get_inline_styles() {
        return '
            .gbt-wrap { max-width: 1200px; }
            .gbt-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
            .gbt-header h1 { margin: 0 0 10px; font-size: 28px; }
            .gbt-header p { margin: 0; opacity: 0.9; }
            .gbt-section { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .gbt-section h2 { margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
            .gbt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
            .gbt-card { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; }
            .gbt-card h3 { margin: 0 0 10px; color: #333; font-size: 16px; }
            .gbt-card .source-name { font-family: monospace; background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
            .gbt-card .field-list { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; font-size: 13px; }
            .gbt-card .field-item { display: inline-block; background: #e8e8e8; padding: 2px 6px; margin: 2px; border-radius: 3px; font-family: monospace; font-size: 12px; }
            .gbt-status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .gbt-status.success { background: #d4edda; color: #155724; }
            .gbt-status.error { background: #f8d7da; color: #721c24; }
            .gbt-status.warning { background: #fff3cd; color: #856404; }
            .gbt-code { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 13px; line-height: 1.5; }
            .gbt-code .comment { color: #6a9955; }
            .gbt-code .string { color: #ce9178; }
            .gbt-code .key { color: #9cdcfe; }
            .gbt-test-result { margin: 15px 0; padding: 15px; border-radius: 6px; }
            .gbt-test-result.pass { background: #d4edda; border: 1px solid #c3e6cb; }
            .gbt-test-result.fail { background: #f8d7da; border: 1px solid #f5c6cb; }
            .gbt-data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .gbt-data-table th, .gbt-data-table td { padding: 8px 12px; text-align: left; border: 1px solid #ddd; font-size: 13px; }
            .gbt-data-table th { background: #f5f5f5; font-weight: 600; }
            .gbt-data-table tr:nth-child(even) { background: #fafafa; }
            .gbt-tabs { display: flex; gap: 5px; margin-bottom: 15px; border-bottom: 2px solid #ddd; padding-bottom: 0; }
            .gbt-tab { padding: 10px 20px; cursor: pointer; border: none; background: #f0f0f0; border-radius: 6px 6px 0 0; font-size: 14px; }
            .gbt-tab.active { background: #667eea; color: white; }
            .gbt-tab-content { display: none; }
            .gbt-tab-content.active { display: block; }
        ';
    }

    /**
     * Render the admin page
     */
    public static function render_admin_page() {
        // Check if Gateway is active
        $gateway_active = class_exists('\\Gateway\\Plugin');
        $bindings_supported = function_exists('register_block_bindings_source');

        ?>
        <div class="wrap gbt-wrap">
            <div class="gbt-header">
                <h1>Gateway Block Bindings Test</h1>
                <p>Visual testing for automatic block binding data sources from Gateway collections</p>
            </div>

            <!-- Status Section -->
            <div class="gbt-section">
                <h2>System Status</h2>
                <table class="gbt-data-table">
                    <tr>
                        <th>Requirement</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                    <tr>
                        <td>WordPress Version</td>
                        <td><span class="gbt-status <?php echo version_compare(get_bloginfo('version'), '6.5', '>=') ? 'success' : 'error'; ?>">
                            <?php echo get_bloginfo('version'); ?>
                        </span></td>
                        <td>Block Bindings API requires WordPress 6.5+</td>
                    </tr>
                    <tr>
                        <td>Block Bindings API</td>
                        <td><span class="gbt-status <?php echo $bindings_supported ? 'success' : 'error'; ?>">
                            <?php echo $bindings_supported ? 'Available' : 'Not Available'; ?>
                        </span></td>
                        <td><code>register_block_bindings_source()</code> function</td>
                    </tr>
                    <tr>
                        <td>Gateway Plugin</td>
                        <td><span class="gbt-status <?php echo $gateway_active ? 'success' : 'error'; ?>">
                            <?php echo $gateway_active ? 'Active' : 'Not Active'; ?>
                        </span></td>
                        <td>Required for collection-based binding sources</td>
                    </tr>
                </table>
            </div>

            <?php if (!$gateway_active): ?>
                <div class="gbt-section">
                    <div class="gbt-test-result fail">
                        <strong>Gateway plugin is not active.</strong><br>
                        Please activate the Gateway plugin to test block bindings.
                    </div>
                </div>
            <?php else: ?>
                <?php self::render_binding_sources(); ?>
                <?php self::render_data_tests(); ?>
                <?php self::render_usage_examples(); ?>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Render registered binding sources
     */
    private static function render_binding_sources() {
        $sources = [];

        // Get sources from BlockBindings if available
        if (class_exists('\\Gateway\\Blocks\\BlockBindings')) {
            $sources = \Gateway\Blocks\BlockBindings::getAvailableSources();
        }

        ?>
        <div class="gbt-section">
            <h2>Registered Binding Sources (<?php echo count($sources); ?> found)</h2>

            <?php if (empty($sources)): ?>
                <div class="gbt-test-result fail">
                    No binding sources found. Collections may not be registered yet.
                </div>
            <?php else: ?>
                <div class="gbt-grid">
                    <?php foreach ($sources as $source_name => $config): ?>
                        <div class="gbt-card">
                            <h3>
                                <?php echo esc_html($config['label']); ?>
                                <span class="gbt-status success">Active</span>
                            </h3>
                            <p><span class="source-name"><?php echo esc_html($source_name); ?></span></p>

                            <div class="field-list">
                                <strong>Available Fields:</strong><br>
                                <?php
                                $fields = $config['fields'] ?? [];
                                if (empty($fields)): ?>
                                    <em>No fields defined</em>
                                <?php else:
                                    $display_fields = array_slice($fields, 0, 10);
                                    foreach ($display_fields as $field): ?>
                                        <span class="field-item"><?php echo esc_html($field); ?></span>
                                    <?php endforeach;
                                    if (count($fields) > 10): ?>
                                        <span class="field-item">+<?php echo count($fields) - 10; ?> more</span>
                                    <?php endif;
                                endif; ?>
                            </div>

                            <p style="margin: 5px 0; font-size: 12px; color: #666;">
                                Class: <code><?php echo esc_html($config['collection_class'] ?? 'N/A'); ?></code>
                            </p>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Render data fetch tests
     */
    private static function render_data_tests() {
        ?>
        <div class="gbt-section">
            <h2>Live Data Tests</h2>
            <p>Testing actual data retrieval from binding sources:</p>

            <div class="gbt-tabs">
                <button class="gbt-tab active" onclick="showTab('users')">Users</button>
                <button class="gbt-tab" onclick="showTab('posts')">Posts</button>
                <button class="gbt-tab" onclick="showTab('custom')">Custom Test</button>
            </div>

            <!-- Users Tab -->
            <div id="tab-users" class="gbt-tab-content active">
                <?php self::test_users_binding(); ?>
            </div>

            <!-- Posts Tab -->
            <div id="tab-posts" class="gbt-tab-content">
                <?php self::test_posts_binding(); ?>
            </div>

            <!-- Custom Tab -->
            <div id="tab-custom" class="gbt-tab-content">
                <?php self::test_custom_binding(); ?>
            </div>
        </div>

        <script>
        function showTab(tabName) {
            document.querySelectorAll('.gbt-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.gbt-tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('[onclick*="' + tabName + '"]').classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
        }
        </script>
        <?php
    }

    /**
     * Test users binding source
     */
    private static function test_users_binding() {
        $registry = \Gateway\Plugin::getInstance()->getRegistry();
        $collection = $registry->get('wp_user');

        if (!$collection) {
            echo '<div class="gbt-test-result fail">wp_user collection not found</div>';
            return;
        }

        try {
            $users = $collection->newQuery()->limit(5)->get();
            $test_passed = $users->count() > 0;
            ?>
            <div class="gbt-test-result <?php echo $test_passed ? 'pass' : 'fail'; ?>">
                <strong>Test: Fetch users via gateway/wp_user</strong><br>
                Status: <?php echo $test_passed ? 'PASSED - ' . $users->count() . ' records found' : 'FAILED - No records'; ?>
            </div>

            <?php if ($test_passed): ?>
                <table class="gbt-data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>user_login</th>
                            <th>display_name</th>
                            <th>user_email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $user): ?>
                            <tr>
                                <td><?php echo esc_html($user->ID); ?></td>
                                <td><?php echo esc_html($user->user_login); ?></td>
                                <td><?php echo esc_html($user->display_name); ?></td>
                                <td><?php echo esc_html($user->user_email); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <h4>Simulated Binding Output</h4>
                <p>If you bound a paragraph to <code>gateway/wp_user</code> with field <code>display_name</code> and ID <code><?php echo $users->first()->ID; ?></code>:</p>
                <div style="background: #f0f0f0; padding: 20px; border-radius: 6px; font-size: 18px;">
                    <strong>Result:</strong> <?php echo esc_html($users->first()->display_name); ?>
                </div>
            <?php endif; ?>
            <?php
        } catch (\Exception $e) {
            echo '<div class="gbt-test-result fail">Error: ' . esc_html($e->getMessage()) . '</div>';
        }
    }

    /**
     * Test posts binding source
     */
    private static function test_posts_binding() {
        $registry = \Gateway\Plugin::getInstance()->getRegistry();
        $collection = $registry->get('wp_post');

        if (!$collection) {
            echo '<div class="gbt-test-result fail">wp_post collection not found</div>';
            return;
        }

        try {
            $posts = $collection->newQuery()
                ->where('post_status', 'publish')
                ->where('post_type', 'post')
                ->limit(5)
                ->get();
            $test_passed = $posts->count() > 0;
            ?>
            <div class="gbt-test-result <?php echo $test_passed ? 'pass' : 'fail'; ?>">
                <strong>Test: Fetch posts via gateway/wp_post</strong><br>
                Status: <?php echo $test_passed ? 'PASSED - ' . $posts->count() . ' records found' : 'FAILED - No published posts'; ?>
            </div>

            <?php if ($test_passed): ?>
                <table class="gbt-data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>post_title</th>
                            <th>post_status</th>
                            <th>post_date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($posts as $post): ?>
                            <tr>
                                <td><?php echo esc_html($post->ID); ?></td>
                                <td><?php echo esc_html(wp_trim_words($post->post_title, 8)); ?></td>
                                <td><?php echo esc_html($post->post_status); ?></td>
                                <td><?php echo esc_html(date('Y-m-d', strtotime($post->post_date))); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <h4>Simulated Binding Output</h4>
                <p>If you bound a heading to <code>gateway/wp_post</code> with field <code>post_title</code> and ID <code><?php echo $posts->first()->ID; ?></code>:</p>
                <div style="background: #f0f0f0; padding: 20px; border-radius: 6px; font-size: 24px; font-weight: bold;">
                    <?php echo esc_html($posts->first()->post_title); ?>
                </div>
            <?php else: ?>
                <p><em>No published posts found. Create a post to test this binding.</em></p>
            <?php endif; ?>
            <?php
        } catch (\Exception $e) {
            echo '<div class="gbt-test-result fail">Error: ' . esc_html($e->getMessage()) . '</div>';
        }
    }

    /**
     * Test custom binding with form input
     */
    private static function test_custom_binding() {
        $sources = [];
        if (class_exists('\\Gateway\\Blocks\\BlockBindings')) {
            $sources = \Gateway\Blocks\BlockBindings::getAvailableSources();
        }

        $selected_source = isset($_GET['test_source']) ? sanitize_text_field($_GET['test_source']) : '';
        $selected_field = isset($_GET['test_field']) ? sanitize_text_field($_GET['test_field']) : '';
        $selected_id = isset($_GET['test_id']) ? intval($_GET['test_id']) : 1;
        ?>
        <form method="get" action="">
            <input type="hidden" name="page" value="gateway-bindings-test">
            <table class="gbt-data-table" style="max-width: 600px;">
                <tr>
                    <th><label for="test_source">Binding Source</label></th>
                    <td>
                        <select name="test_source" id="test_source" style="width: 100%;">
                            <option value="">-- Select Source --</option>
                            <?php foreach ($sources as $name => $config): ?>
                                <option value="<?php echo esc_attr($name); ?>" <?php selected($selected_source, $name); ?>>
                                    <?php echo esc_html($name); ?> (<?php echo esc_html($config['label']); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="test_field">Field Name</label></th>
                    <td><input type="text" name="test_field" id="test_field" value="<?php echo esc_attr($selected_field); ?>" placeholder="e.g., display_name, post_title" style="width: 100%;"></td>
                </tr>
                <tr>
                    <th><label for="test_id">Record ID</label></th>
                    <td><input type="number" name="test_id" id="test_id" value="<?php echo esc_attr($selected_id); ?>" min="1" style="width: 100%;"></td>
                </tr>
                <tr>
                    <td></td>
                    <td><button type="submit" class="button button-primary">Test Binding</button></td>
                </tr>
            </table>
        </form>

        <?php
        if ($selected_source && $selected_field && $selected_id) {
            self::execute_custom_test($selected_source, $selected_field, $selected_id);
        }
    }

    /**
     * Execute a custom binding test
     */
    private static function execute_custom_test($source, $field, $id) {
        // Extract collection key from source name (gateway/wp_user -> wp_user)
        $collection_key = str_replace('gateway/', '', $source);

        $registry = \Gateway\Plugin::getInstance()->getRegistry();
        $collection = $registry->get($collection_key);

        if (!$collection) {
            echo '<div class="gbt-test-result fail">Collection not found: ' . esc_html($collection_key) . '</div>';
            return;
        }

        try {
            $primary_key = $collection->getKeyName();
            $record = $collection->newQuery()->where($primary_key, $id)->first();

            if (!$record) {
                echo '<div class="gbt-test-result fail">Record not found with ' . esc_html($primary_key) . ' = ' . esc_html($id) . '</div>';
                return;
            }

            $value = $record->$field ?? null;
            ?>
            <div class="gbt-test-result pass">
                <strong>Test Results</strong><br>
                Source: <code><?php echo esc_html($source); ?></code><br>
                Field: <code><?php echo esc_html($field); ?></code><br>
                ID: <code><?php echo esc_html($id); ?></code>
            </div>

            <h4>Retrieved Value:</h4>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 6px; font-size: 18px; word-break: break-word;">
                <?php if ($value !== null): ?>
                    <?php echo esc_html(is_string($value) ? $value : json_encode($value)); ?>
                <?php else: ?>
                    <em style="color: #999;">NULL (field may not exist)</em>
                <?php endif; ?>
            </div>

            <h4>Block Markup to Use:</h4>
            <pre class="gbt-code">&lt;!-- wp:paragraph {
    <span class="string">"metadata"</span>: {
        <span class="string">"bindings"</span>: {
            <span class="string">"content"</span>: {
                <span class="string">"source"</span>: <span class="string">"<?php echo esc_html($source); ?>"</span>,
                <span class="string">"args"</span>: {
                    <span class="string">"field"</span>: <span class="string">"<?php echo esc_html($field); ?>"</span>,
                    <span class="string">"id"</span>: <?php echo esc_html($id); ?>
                }
            }
        }
    }
} --&gt;
&lt;p&gt;&lt;/p&gt;
&lt;!-- /wp:paragraph --&gt;</pre>
            <?php
        } catch (\Exception $e) {
            echo '<div class="gbt-test-result fail">Error: ' . esc_html($e->getMessage()) . '</div>';
        }
    }

    /**
     * Render usage examples
     */
    private static function render_usage_examples() {
        ?>
        <div class="gbt-section">
            <h2>Usage Examples</h2>

            <h3>1. Basic Paragraph Binding</h3>
            <p>Bind a user's display name to a paragraph:</p>
            <pre class="gbt-code"><span class="comment">&lt;!-- Displays the display_name of user ID 1 --&gt;</span>
&lt;!-- wp:paragraph {
    <span class="string">"metadata"</span>: {
        <span class="string">"bindings"</span>: {
            <span class="string">"content"</span>: {
                <span class="string">"source"</span>: <span class="string">"gateway/wp_user"</span>,
                <span class="string">"args"</span>: {
                    <span class="string">"field"</span>: <span class="string">"display_name"</span>,
                    <span class="string">"id"</span>: 1
                }
            }
        }
    }
} --&gt;
&lt;p&gt;&lt;/p&gt;
&lt;!-- /wp:paragraph --&gt;</pre>

            <h3>2. Post Title in Heading</h3>
            <p>Bind a post title to a heading:</p>
            <pre class="gbt-code"><span class="comment">&lt;!-- Displays post_title of post ID 42 --&gt;</span>
&lt;!-- wp:heading {
    <span class="string">"metadata"</span>: {
        <span class="string">"bindings"</span>: {
            <span class="string">"content"</span>: {
                <span class="string">"source"</span>: <span class="string">"gateway/wp_post"</span>,
                <span class="string">"args"</span>: {
                    <span class="string">"field"</span>: <span class="string">"post_title"</span>,
                    <span class="string">"id"</span>: 42
                }
            }
        }
    }
} --&gt;
&lt;h2&gt;&lt;/h2&gt;
&lt;!-- /wp:heading --&gt;</pre>

            <h3>3. Inside Query Loop (Context-Based)</h3>
            <p>When inside a Query Loop, the post ID comes from context automatically:</p>
            <pre class="gbt-code"><span class="comment">&lt;!-- No ID needed - uses postId from Query Loop context --&gt;</span>
&lt;!-- wp:query {"queryId":1,"query":{"postType":"post"}} --&gt;
&lt;div class="wp-block-query"&gt;
    &lt;!-- wp:post-template --&gt;
        &lt;!-- wp:paragraph {
            <span class="string">"metadata"</span>: {
                <span class="string">"bindings"</span>: {
                    <span class="string">"content"</span>: {
                        <span class="string">"source"</span>: <span class="string">"gateway/wp_post"</span>,
                        <span class="string">"args"</span>: {
                            <span class="string">"field"</span>: <span class="string">"post_excerpt"</span>
                        }
                    }
                }
            }
        } --&gt;
        &lt;p&gt;&lt;/p&gt;
        &lt;!-- /wp:paragraph --&gt;
    &lt;!-- /wp:post-template --&gt;
&lt;/div&gt;
&lt;!-- /wp:query --&gt;</pre>

            <h3>4. Image with Multiple Bindings</h3>
            <p>Bind both URL and alt text:</p>
            <pre class="gbt-code">&lt;!-- wp:image {
    <span class="string">"metadata"</span>: {
        <span class="string">"bindings"</span>: {
            <span class="string">"url"</span>: {
                <span class="string">"source"</span>: <span class="string">"gateway/gateway_project"</span>,
                <span class="string">"args"</span>: { <span class="string">"field"</span>: <span class="string">"image_url"</span>, <span class="string">"id"</span>: 5 }
            },
            <span class="string">"alt"</span>: {
                <span class="string">"source"</span>: <span class="string">"gateway/gateway_project"</span>,
                <span class="string">"args"</span>: { <span class="string">"field"</span>: <span class="string">"title"</span>, <span class="string">"id"</span>: 5 }
            }
        }
    }
} --&gt;
&lt;figure class="wp-block-image"&gt;&lt;img alt=""/&gt;&lt;/figure&gt;
&lt;!-- /wp:image --&gt;</pre>
        </div>
        <?php
    }
}

// Initialize the plugin
add_action('plugins_loaded', ['Gateway_Bindings_Test', 'init']);
