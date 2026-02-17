<?php

namespace Gateway\Forms\Fields\FieldTypes;

class WysiwygField extends \Gateway\Field {

    protected $type   = 'wysiwyg';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Start typing...',
            'placeholder' => 'Start typing...',
            'description' => 'Placeholder text shown in the editor when empty.',
        ],
        [
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => '',
            'description' => 'Pre-filled HTML content when a new entry is created.',
        ],
    ];

}
