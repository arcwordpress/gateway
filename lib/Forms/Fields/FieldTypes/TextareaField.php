<?php

namespace Gateway\Forms\Fields\FieldTypes;

class TextareaField extends \Gateway\Field {

    protected $type   = 'textarea';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'Enter text...',
            'description' => 'Placeholder text shown inside the textarea when empty.',
        ],
        [
            'name'        => 'rows',
            'label'       => 'Rows',
            'type'        => 'text',
            'required'    => false,
            'default'     => '5',
            'placeholder' => '5',
            'description' => 'Number of visible text rows in the textarea.',
        ],
        [
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => '',
            'description' => 'Pre-filled value when a new entry is created.',
        ],
    ];

}
