<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class PasswordField extends \Gateway\Field {

    protected $type   = 'password';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
        ],
        [
            'name'        => 'autoComplete',
            'label'       => 'AutoComplete',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'current-password',
            'placeholder' => 'current-password',
            'description' => 'current-password, new-password, or off',
        ],
    ];

}
