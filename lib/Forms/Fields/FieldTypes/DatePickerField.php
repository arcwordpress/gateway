<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class DatePickerField extends \Gateway\Field {

    protected $type   = 'date-picker';
    protected $fields = [
        [
            'name'        => 'dateFormat',
            'label'       => 'Date Format',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'MM/dd/yyyy',
            'placeholder' => 'MM/dd/yyyy',
            'description' => 'Display format, e.g. MM/dd/yyyy or dd-MM-yyyy',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select date...',
            'placeholder' => 'Select date...',
        ],
        [
            'name'        => 'minDate',
            'label'       => 'Min Date',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '2020-01-01',
            'description' => 'Earliest selectable date (YYYY-MM-DD)',
        ],
        [
            'name'        => 'maxDate',
            'label'       => 'Max Date',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '2030-12-31',
            'description' => 'Latest selectable date (YYYY-MM-DD)',
        ],
    ];

}
