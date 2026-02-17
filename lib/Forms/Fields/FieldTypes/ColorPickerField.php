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
            'type'        => 'text',
            'required'    => false,
            'default'     => 'true',
            'placeholder' => 'true',
            'description' => 'Use "true" or "false"',
        ],
        [
            'name'        => 'swatches',
            'label'       => 'Custom Swatches',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '#000000, #FFFFFF, #EF4444, #F59E0B',
            'description' => 'Comma-separated hex colors for the swatch row',
        ],
    ];

}
