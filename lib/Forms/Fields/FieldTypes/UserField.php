<?php

namespace Gateway\Forms\Fields\FieldTypes;

class UserField extends \Gateway\Field {

    protected $type   = 'user';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Search Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Search for a user...',
            'placeholder' => 'Search for a user...',
            'description' => 'Placeholder text shown in the user search input.',
        ],
        [
            'name'        => 'role',
            'label'       => 'Restrict by Role',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'e.g. editor, author',
            'description' => 'Limit user search results to a specific WordPress role. Leave empty to search all roles.',
        ],
        [
            'name'        => 'multiple',
            'label'       => 'Allow Multiple',
            'type'        => 'boolean',
            'required'    => false,
            'default'     => false,
            'description' => 'Allow selecting multiple users.',
        ],
    ];

}
