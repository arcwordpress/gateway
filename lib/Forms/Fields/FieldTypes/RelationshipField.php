<?php

namespace Gateway\Forms\Fields\FieldTypes;

class RelationshipField extends \Gateway\Field {

    protected $type   = 'relationship';

    /**
     * Config keys use no dot-notation so they survive arrayToPhp() key sanitisation
     * and are accessible as plain properties on the field config object in JS:
     *   config.relationship   → relationship method name (e.g. "docSet")
     *   config.displayField   → field to show as label (default "title")
     *   config.valueField     → field stored as value  (default "id")
     *   config.placeholder    → dropdown placeholder
     */
    protected $fields = [
        [
            'name'        => 'relationship',
            'label'       => 'Relationship Name',
            'type'        => 'text',
            'required'    => true,
            'placeholder' => 'e.g. docSet',
            'description' => 'The Eloquent relationship method name on this collection (e.g. "docSet"). Related records are eager-loaded automatically via relations=true.',
        ],
        [
            'name'        => 'displayField',
            'label'       => 'Display Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'title',
            'placeholder' => 'title',
            'description' => 'Field on the related record to use as the human-readable label.',
        ],
        [
            'name'        => 'valueField',
            'label'       => 'Value Field',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'id',
            'placeholder' => 'id',
            'description' => 'Field on the related record to store as the value.',
        ],
        [
            'name'        => 'placeholder',
            'label'       => 'Dropdown Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select an option...',
            'placeholder' => 'Select an option...',
        ],
    ];

}
