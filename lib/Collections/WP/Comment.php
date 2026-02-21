<?php

namespace Gateway\Collections\WP;

class Comment extends \Gateway\Collection {

    protected $core    = true;
    protected $key    = 'wp_comment';
    protected $title  = 'Comment';
    protected $titlePlural = 'Comments';
    protected $table = 'comments';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'comment_ID';

    /**
     * WordPress comments table uses custom timestamp columns
     */
    public $timestamps = false;

    /**
     * Core fields for creating/editing a comment
     */
    protected $fields = [
        [
            'name'  => 'comment_post_ID',
            'type'  => 'number',
            'label' => 'Post ID',
            'required' => true
        ],
        [
            'name'  => 'comment_author',
            'type'  => 'text',
            'label' => 'Author Name',
            'required' => true
        ],
        [
            'name'  => 'comment_author_email',
            'type'  => 'email',
            'label' => 'Author Email',
            'required' => false
        ],
        [
            'name'  => 'comment_content',
            'type'  => 'textarea',
            'label' => 'Content',
            'required' => true
        ],
        [
            'name'  => 'comment_approved',
            'type'  => 'select',
            'label' => 'Status',
            'options' => ['1', '0', 'spam', 'trash'],
            'required' => true
        ],
        [
            'name'  => 'comment_date',
            'type'  => 'text',
            'label' => 'Date'
        ]
    ];

}
