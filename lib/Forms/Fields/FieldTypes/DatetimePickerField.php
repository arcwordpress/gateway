<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class DatetimePickerField extends \Gateway\Field {

    protected $type   = 'datetime-picker';
    protected $fields = [
        [
            'name'        => 'dateTimeFormat',
            'label'       => 'Date/Time Format',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'MM/dd/yyyy h:mm aa',
            'placeholder' => 'MM/dd/yyyy h:mm aa',
            'description' => 'Display format for date and time',
        ],
        [
            'name'        => 'timeIntervals',
            'label'       => 'Time Intervals (minutes)',
            'type'        => 'text',
            'required'    => false,
            'default'     => '15',
            'placeholder' => '15',
            'description' => 'Minute increments shown in the time selector',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select date and time...',
            'placeholder' => 'Select date and time...',
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
