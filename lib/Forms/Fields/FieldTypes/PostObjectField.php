<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class PostObjectField extends \Gateway\Field {

    protected $type   = 'post-object';
    protected $fields = [
        [
            'name'        => 'postType',
            'label'       => 'Post Type',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'post',
            'placeholder' => 'post',
            'description' => 'WordPress post type slug, e.g. post, page, or a custom type',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Search Placeholder',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => 'Search posts...',
        ],
        [
            'name'        => 'resultsPerPage',
            'label'       => 'Results Per Page',
            'type'        => 'text',
            'required'    => false,
            'default'     => '10',
            'placeholder' => '10',
        ],
        [
            'name'        => 'postStatus',
            'label'       => 'Post Status Filter',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => 'publish',
            'description' => 'Leave empty to include all statuses',
        ],
    ];

}
