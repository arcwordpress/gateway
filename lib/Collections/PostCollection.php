<?php

namespace Gateway\Collections;

class PostCollection extends \Gateway\Collection {

    protected $key    = 'wp_post';
    protected $title  = 'Post';
    protected $titlePlural = 'Posts';
    protected $table = 'posts';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'ID';

    /**
     * WordPress posts table uses custom timestamp columns
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a post
     */
    protected $fields = [
        [
            'name'  => 'post_title',
            'type'  => 'text',
            'label' => 'Title',
            'required' => true
        ],
        [
            'name'  => 'post_content',
            'type'  => 'textarea',
            'label' => 'Content',
            'required' => false
        ],
        [
            'name'  => 'post_author',
            'type'  => 'number',
            'label' => 'Author ID',
            'required' => true
        ],
        [
            'name'  => 'post_status',
            'type'  => 'select',
            'label' => 'Status',
            'options' => ['publish', 'draft', 'pending', 'private'],
            'required' => true
        ],
        [
            'name'  => 'post_type',
            'type'  => 'select',
            'label' => 'Post Type',
            'options' => ['post', 'page'],
            'required' => true
        ],
        [
            'name'  => 'post_name',
            'type'  => 'slug',
            'label' => 'Slug'
        ]
    ];

}
