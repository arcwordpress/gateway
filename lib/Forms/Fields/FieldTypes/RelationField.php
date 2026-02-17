<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class RelationField extends \Gateway\Field {

    protected $type   = 'relation';
    protected $fields = [
        [
            'name'        => 'relation.endpoint',
            'label'       => 'API Endpoint',
            'type'        => 'text',
            'required'    => true,
            'placeholder' => '/wp-json/gateway/v1/...',
            'description' => 'The API endpoint to fetch related objects from',
        ],
        [
            'name'        => 'relation.labelField',
            'label'       => 'Label Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'title',
            'placeholder' => 'title',
            'description' => 'Field name to use as the display label',
        ],
        [
            'name'        => 'relation.valueField',
            'label'       => 'Value Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'id',
            'placeholder' => 'id',
            'description' => 'Field name to use as the stored value',
        ],
        [
            'name'        => 'relation.placeholder',
            'label'       => 'Dropdown Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select an option...',
            'placeholder' => 'Select an option...',
        ],
    ];

}
