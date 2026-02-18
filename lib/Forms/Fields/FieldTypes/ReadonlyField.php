<?php

namespace Gateway\Forms\Fields\FieldTypes;

class ReadonlyField extends \Gateway\Field {

    protected $type   = 'readonly';
    protected $fields = [
        [
            'name'        => 'value',
            'label'       => 'Static Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
            'description' => 'Fixed value shown in the field. Leave empty to display the current form value.',
        ],
        [
            'name'        => 'default',
            'label'       => 'Default Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
            'description' => 'Fallback value when no form value or static value is set.',
        ],
    ];

}
