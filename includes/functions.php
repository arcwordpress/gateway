<?php

// Define constants
define('GATEWAY_COLLECTION_CPT', 'gateway-collection');

function gateway_core_active() {
    return class_exists('\Gateway\Plugin');
}

function gateway_extension_registry() {
    return \Gateway\Extensions\ExtensionRegistry::instance();
}

function gateway_registered_extensions_array() {
    $registry = gateway_extension_registry();
    $extensions = $registry->getAll();

    // Convert to array format (e.g., key, class name)
    $result = [];
    foreach ($extensions as $key => $extension) {
        $result[] = [
            'key' => $key,
            'class' => get_class($extension),
        ];
    }
    return $result;
}

/**
 * Check if current admin screen is for a specific post type
 * Can be called early on init before post type is fully available
 * 
 * @param string $post_type The post type to check for
 * @return bool True if current screen matches post type
 */
function gateway_is_post_type_screen($post_type) {
    if (!is_admin()) {
        return false;
    }
    
    global $pagenow;
    $typenow = '';
    
    if ('post-new.php' === $pagenow) {
        if (isset($_REQUEST['post_type']) && post_type_exists($_REQUEST['post_type'])) {
            $typenow = $_REQUEST['post_type'];
        }
    } elseif ('post.php' === $pagenow) {
        if (isset($_GET['post']) && isset($_POST['post_ID']) && (int) $_GET['post'] !== (int) $_POST['post_ID']) {
            // Do nothing
        } elseif (isset($_GET['post'])) {
            $post_id = (int) $_GET['post'];
        } elseif (isset($_POST['post_ID'])) {
            $post_id = (int) $_POST['post_ID'];
        }
        
        if (!empty($post_id)) {
            $post = get_post($post_id);
            if ($post) {
                $typenow = $post->post_type;
            }
        }
    }
    
    return $typenow === $post_type;
}

/**
 * Handle Collection CPT saves
 */
add_action('save_post_' . GATEWAY_COLLECTION_CPT, function($post_id, $post, $update) {
    // Avoid autosaves
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Check user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Only process published posts
    if ($post->post_status !== 'publish') {
        return;
    }
    
    // TODO: Get plugin slug and namespace from project association
    $pluginSlug = 'horizon';
    $pluginNamespace = 'Horizon';
    
    // Parse collection blocks
    $collectionData = \Gateway\Collections\InterfaceBuild::parseCollectionBlocks($post->post_content);
    
    if (!$collectionData) {
        error_log('[Gateway Collection] Failed to parse collection blocks for: ' . $post->post_title);
        return;
    }
    
    // Save collection data to JSON file in plugin
    $saved = \Gateway\Collections\InterfaceBuild::saveCollectionJson($collectionData, $pluginSlug);
    
    if ($saved) {
        error_log('[Gateway Collection] Saved collection JSON for: ' . $post->post_title);
    } else {
        error_log('[Gateway Collection] Failed to save collection JSON for: ' . $post->post_title);
        return;
    }
    
    // Generate collection class file
    $generated = \Gateway\Collections\FileFromData::generateCollectionClass($collectionData, $pluginSlug, $pluginNamespace);
    
    if ($generated) {
        error_log('[Gateway Collection] Generated collection class for: ' . $post->post_title);
    } else {
        error_log('[Gateway Collection] Failed to generate collection class for: ' . $post->post_title);
    }
    
    // TODO: Run migrations
    
}, 10, 3);

/**
 * Handle project saves and scaffold plugin extensions
 */
add_action('gateway_save_record', function($model, $collectionName, $operation) {

    // Only process gateway_project collections
    if ($collectionName !== 'gateway_project') {
        return;
    }
    
    // Get project title
    $project_title = isset($model['title']) ? trim($model['title']) : '';
    if (empty($project_title)) {
        error_log('[Gateway] Project title is empty, cannot scaffold plugin');
        return;
    }
    
    // Create plugin identifiers
    $plugin_slug = sanitize_key($project_title);
    $namespace = ucfirst($plugin_slug);
    $constant_prefix = strtoupper($plugin_slug);
    
    $plugin_dir = WP_PLUGIN_DIR . '/' . $plugin_slug;
    $plugin_file = $plugin_dir . '/Plugin.php';
    
    // Step 1: Ensure directory exists
    if (!file_exists($plugin_dir)) {
        if (!wp_mkdir_p($plugin_dir)) {
            error_log("[Gateway] Failed to create plugin directory: {$plugin_dir}");
            return;
        }
    }
    
    // Step 2: Create/update main plugin file
    $template_path = dirname(__DIR__) . '/templates/scaffold/plugin_main.php';
    if (!file_exists($template_path)) {
        error_log("[Gateway] Template not found: {$template_path}");
        return;
    }
    
    $template = file_get_contents($template_path);
    
    // Replace placeholders
    $replacements = [
        '{{PROJECT_NAME}}' => $project_title,
        '{{PROJECT_SLUG}}' => $plugin_slug,
        '{{NAMESPACE}}' => $namespace,
        '{{CONSTANT_PREFIX}}' => $constant_prefix,
    ];
    
    $plugin_content = str_replace(array_keys($replacements), array_values($replacements), $template);
    
    // Write main plugin file (overwrites if exists)
    if (file_put_contents($plugin_file, $plugin_content) === false) {
        error_log("[Gateway] Failed to create main plugin file: {$plugin_file}");
        return;
    }
    
    chmod($plugin_file, 0644);
    
    // Step 3: Create lib directories
    $lib_dir = $plugin_dir . '/lib';
    $collections_dir = $lib_dir . '/Collections';
    $migrations_dir = $lib_dir . '/Migrations';
    
    if (!wp_mkdir_p($lib_dir)) {
        error_log("[Gateway] Failed to create lib directory: {$lib_dir}");
        return;
    }
    
    if (!wp_mkdir_p($collections_dir)) {
        error_log("[Gateway] Failed to create Collections directory: {$collections_dir}");
        return;
    }
    
    if (!wp_mkdir_p($migrations_dir)) {
        error_log("[Gateway] Failed to create Migrations directory: {$migrations_dir}");
        return;
    }
    
    // TODO: Step 4 - Create collection and migration classes
    
    // Step 5: Activate the plugin
    $plugin_relative = $plugin_slug . '/Plugin.php';
    
    // Check if plugin file exists
    if (!file_exists($plugin_file)) {
        error_log("[Gateway] Plugin file not found: {$plugin_file}");
        return;
    }
    
    // Check if already active
    if (!function_exists('is_plugin_active')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    if (is_plugin_active($plugin_relative)) {
        return; // Already active
    }
    
    // Activate the plugin
    if (!function_exists('activate_plugin')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    $activate = activate_plugin($plugin_relative);
    
    if (is_wp_error($activate)) {
        error_log("[Gateway] Failed to activate plugin: " . $activate->get_error_message());
        return;
    }
    
}, 10, 3);

