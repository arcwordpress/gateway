<?php

namespace Gateway\Forms\Fields\FieldTypes;

class UrlField extends \Gateway\Field {

    protected $type   = 'url';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'https://example.com',
            'placeholder' => 'https://example.com',
            'description' => 'Placeholder text shown inside the URL input when empty.',
        ],
        [
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'https://',
            'description' => 'Pre-filled URL value when a new entry is created.',
        ],
    ];

}
