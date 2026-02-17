<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class CheckboxField extends \Gateway\Field {

    protected $type   = 'checkbox';
    protected $fields = [
        [
            'name'        => 'default',
            'label'       => 'Checked by Default',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => 'false',
            'description' => 'Use "true" or "false"',
        ],
    ];

}
