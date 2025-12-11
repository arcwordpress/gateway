<?php

/**
 * Register gateway_collection custom post type
 */
function gateway_register_collection_post_type() {
    $labels = [
        'name'                  => _x('Collections', 'Post type general name', 'gateway'),
        'singular_name'         => _x('Collection', 'Post type singular name', 'gateway'),
        'menu_name'             => _x('Collections', 'Admin Menu text', 'gateway'),
        'name_admin_bar'        => _x('Collection', 'Add New on Toolbar', 'gateway'),
        'add_new'               => __('Add New', 'gateway'),
        'add_new_item'          => __('Add New Collection', 'gateway'),
        'new_item'              => __('New Collection', 'gateway'),
        'edit_item'             => __('Edit Collection', 'gateway'),
        'view_item'             => __('View Collection', 'gateway'),
        'all_items'             => __('All Collections', 'gateway'),
        'search_items'          => __('Search Collections', 'gateway'),
        'not_found'             => __('No collections found.', 'gateway'),
        'not_found_in_trash'    => __('No collections found in Trash.', 'gateway'),
    ];

    $args = [
        'labels'                => $labels,
        'public'                => false,
        'publicly_queryable'    => false,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'query_var'             => true,
        'rewrite'               => false,
        'capability_type'       => 'post',
        'has_archive'           => false,
        'hierarchical'          => false,
        'menu_position'         => 80,
        'menu_icon'             => 'dashicons-database',
        'supports'              => ['title', 'editor'],
        'show_in_rest'          => true,
    ];

    register_post_type(GATEWAY_COLLECTION_CPT, $args);
}

add_action('init', 'gateway_register_collection_post_type');