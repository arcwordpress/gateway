<?php

namespace Gateway\Forms\Fields\FieldTypes;

class RelationshipField extends \Gateway\Field {

    protected $type   = 'relationship';
    protected $fields = [
        [
            'name'        => 'relationship.name',
            'label'       => 'Relationship Name',
            'type'        => 'text',
            'required'    => true,
            'placeholder' => 'e.g. docSet',
            'description' => 'The name of the Eloquent relationship method on this collection (e.g. "docSet" maps to a docSet() method). Related records are loaded automatically via relations=true.',
        ],
        [
            'name'        => 'relationship.displayField',
            'label'       => 'Display Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'title',
            'placeholder' => 'title',
            'description' => 'Field on the related record to use as the human-readable label.',
        ],
        [
            'name'        => 'relationship.valueField',
            'label'       => 'Value Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'id',
            'placeholder' => 'id',
            'description' => 'Field on the related record to store as the value.',
        ],
        [
            'name'        => 'relationship.placeholder',
            'label'       => 'Dropdown Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select an option...',
            'placeholder' => 'Select an option...',
        ],
    ];

}
