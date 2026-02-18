<?php

namespace Gateway\Forms\Fields\FieldTypes;

class SlugField extends \Gateway\Field {

    protected $type   = 'slug';
    protected $fields = [
        [
            'name'        => 'watchField',
            'label'       => 'Watch Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'title',
            'placeholder' => 'title',
            'description' => 'The name of another field whose value is automatically slugified into this field.',
        ],
        [
            'name'        => 'prefix',
            'label'       => 'URL Prefix',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'e.g. /posts/',
            'description' => 'Optional prefix displayed before the slug (cosmetic only, not stored in value).',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'Auto-generated from watched field',
            'description' => 'Placeholder text shown in the input when empty.',
        ],
    ];

}
