<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class HiddenField extends \Gateway\Field {

    protected $type   = 'hidden';
    protected $fields = [
        [
            'name'        => 'value',
            'label'       => 'Fixed Value',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
            'description' => 'Static value submitted with the form',
        ],
    ];

}
