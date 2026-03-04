<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class RangeField extends \Gateway\Field {

    protected $type   = 'range';
    protected $fields = [
        [
            'name'        => 'min',
            'label'       => 'Minimum',
            'type'        => 'text',
            'required'    => false,
            'default'     => '0',
            'placeholder' => '0',
        ],
        [
            'name'        => 'max',
            'label'       => 'Maximum',
            'type'        => 'text',
            'required'    => false,
            'default'     => '100',
            'placeholder' => '100',
        ],
        [
            'name'        => 'step',
            'label'       => 'Step',
            'type'        => 'text',
            'required'    => false,
            'default'     => '1',
            'placeholder' => '1',
        ],
        [
            'name'        => 'prepend',
            'label'       => 'Prepend',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '$',
            'description' => 'Symbol shown before the value, e.g. $',
            'group'       => 'display',
        ],
        [
            'name'        => 'append',
            'label'       => 'Append',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => 'kg',
            'description' => 'Symbol shown after the value, e.g. kg or %',
            'group'       => 'display',
        ],
        [
            'name'        => 'showMinMax',
            'label'       => 'Show Min/Max Labels',
            'type'        => 'checkbox',
            'required'    => false,
            'default'     => true,
            'group'       => 'display',
        ],
    ];

}
