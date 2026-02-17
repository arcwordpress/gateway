<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class MarkdownField extends \Gateway\Field {

    protected $type   = 'markdown';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Enter markdown text...',
            'placeholder' => 'Enter markdown text...',
        ],
        [
            'name'        => 'minHeight',
            'label'       => 'Min Height',
            'type'        => 'text',
            'required'    => false,
            'default'     => '200px',
            'placeholder' => '200px',
            'description' => 'CSS height, e.g. 200px',
        ],
        [
            'name'        => 'maxHeight',
            'label'       => 'Max Height',
            'type'        => 'text',
            'required'    => false,
            'default'     => '500px',
            'placeholder' => '500px',
            'description' => 'CSS height, e.g. 500px',
        ],
    ];

}
