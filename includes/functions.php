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
 * Check if Gateway has a working database connection
 *
 * This function tests the database connection with a fast timeout
 * and caches the result to avoid repeated slow checks.
 *
 * @param bool $force_check Force a new connection test, bypassing cache
 * @return bool True if connection is working, false otherwise
 */
function gateway_db_connection($force_check = false) {
    // Check cache first unless forced
    if (!$force_check) {
        $cached = get_transient('gateway_db_connection_status');
        if ($cached !== false) {
            return $cached === 'connected';
        }
    }

    // Test connection with timeout
    $connection_ok = \Gateway\Database\DatabaseConnection::testConnectionWithTimeout(2);

    // Cache result - successful connections cached longer than failures
    // This allows quick recovery detection for failed connections
    $cache_duration = $connection_ok ? 300 : 60; // 5 minutes vs 1 minute
    set_transient(
        'gateway_db_connection_status',
        $connection_ok ? 'connected' : 'failed',
        $cache_duration
    );

    return $connection_ok;
}

/**
 * Clear the database connection status cache
 *
 * Call this after changing database configuration settings
 * (e.g., after updating gateway_connection_port or gateway_db_config)
 */
function gateway_clear_connection_cache() {
    delete_transient('gateway_db_connection_status');
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

function gateway_rest_dispatch_filter()
{
    add_filter('rest_dispatch_request', function ($result, $request, $route, $handler) {
        if ($result !== null || strpos($route, '/gateway/v1') !== 0) {
            return $result;
        }
        $callback = $handler['callback'] ?? null;
        if (!$callback || !is_callable($callback)) {
            return $result;
        }
        try {
            return call_user_func($callback, $request);
        } catch (\Exception $e) {
            error_log('Gateway REST handler error on ' . $route . ': ' . $e->getMessage());
            return new \WP_Error(
                'gateway_db_error',
                'Gateway database tables are not yet initialised. Check Gateway Settings.',
                ['status' => 503]
            );
        }
    }, 10, 4);
}

/**
 * Normalize rest_url() to use https:// when PHP detects an SSL connection.
 *
 * In Local WP (and similar reverse-proxy HTTPS setups), WP_HOME / WP_SITEURL
 * may be hardcoded to http:// in wp-config.php even after HTTPS is enabled.
 * That causes rest_url() to return an http:// base URL while the admin page
 * is served over https://, so the JS apps send REST requests to http://.
 * Browsers then either block those requests as mixed content, or follow the
 * nginx HTTP→HTTPS redirect — which strips the X-WP-Nonce header — causing
 * WordPress's rest_cookie_check_errors to return 403 for every Gateway route.
 *
 * Forcing the scheme to https:// when is_ssl() is true ensures requests go
 * directly to the HTTPS endpoint with the nonce header intact, matching the
 * cookie (SECURE_AUTH_COOKIE) that WordPress set during login.
 */
add_filter('rest_url', function ($url) {
    if (is_ssl()) {
        return set_url_scheme($url, 'https');
    }
    return $url;
});

