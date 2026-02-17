<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class OembedField extends \Gateway\Field {

    protected $type   = 'oembed';
    protected $fields = [
        [
            'name'        => 'placeholder',
            'label'       => 'Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'https://www.youtube.com/watch?v=...',
            'placeholder' => 'https://www.youtube.com/watch?v=...',
        ],
    ];

}
