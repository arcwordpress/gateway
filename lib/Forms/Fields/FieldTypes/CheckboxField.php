<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class CheckboxField extends \Gateway\Field {

    protected $type   = 'checkbox';
    protected $fields = [
        [
            'name'        => 'default',
            'label'       => 'Checked by Default',
            'type'        => 'boolean',
            'required'    => false,
            'default'     => false,
        ],
    ];

}
