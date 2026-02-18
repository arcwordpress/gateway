<?php

namespace Gateway\Forms\Fields\FieldTypes;

class TimePickerField extends \Gateway\Field {

    protected $type   = 'time-picker';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => '',
            'placeholder' => 'Select a time',
            'description' => 'Placeholder text shown in the time picker input when empty.',
        ],
        [
            'name'        => 'timeIntervals',
            'label'       => 'Time Intervals (minutes)',
            'type'        => 'text',
            'required'    => false,
            'default'     => '15',
            'placeholder' => '15',
            'description' => 'Interval between selectable times in minutes (e.g. 15, 30, 60).',
        ],
        [
            'name'        => 'timeFormat',
            'label'       => 'Time Format',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'h:mm aa',
            'placeholder' => 'h:mm aa',
            'description' => 'Format string for the time display (e.g. h:mm aa, HH:mm).',
        ],
        [
            'name'        => 'dateFormat',
            'label'       => 'Display Format',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'h:mm aa',
            'placeholder' => 'h:mm aa',
            'description' => 'Format string used by the datepicker component for rendering the selected time.',
        ],
    ];

}
