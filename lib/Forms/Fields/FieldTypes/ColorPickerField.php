<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class ColorPickerField extends \Gateway\Field {

    protected $type   = 'color-picker';
    protected $fields = [
        [
            'name'        => 'default',
            'label'       => 'Default Color',
            'type'        => 'text',
            'required'    => false,
            'default'     => '#000000',
            'placeholder' => '#000000',
            'description' => 'Hex color code, e.g. #FF5733',
        ],
        [
            'name'        => 'showSwatches',
            'label'       => 'Show Swatches',
            'type'        => 'checkbox',
            'required'    => false,
            'default'     => true,
            'group'       => 'advanced',
        ],
        [
            'name'        => 'swatches',
            'label'       => 'Custom Swatches',
            'type'        => 'textarea',
            'required'    => false,
            'placeholder' => '#000000' . "\n" . '#FFFFFF' . "\n" . '#EF4444',
            'description' => 'One hex color per line',
            'group'       => 'advanced',
        ],
    ];

}
