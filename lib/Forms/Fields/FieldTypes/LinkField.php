<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class LinkField extends \Gateway\Field {

    protected $type   = 'link';
    protected $fields = [
        [
            'name'        => 'urlPlaceholder',
            'label'       => 'URL Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'https://example.com',
            'placeholder' => 'https://example.com',
        ],
        [
            'name'        => 'titlePlaceholder',
            'label'       => 'Link Text Placeholder',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Click here',
            'placeholder' => 'Click here',
        ],
        [
            'name'        => 'requireTitle',
            'label'       => 'Require Link Text',
            'type'        => 'checkbox',
            'required'    => false,
            'default'     => false,
        ],
        [
            'name'        => 'enableTarget',
            'label'       => 'Enable Target Selection',
            'type'        => 'checkbox',
            'required'    => false,
            'default'     => true,
        ],
        [
            'name'        => 'addButtonText',
            'label'       => 'Add Link Button Text',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Add Link',
            'placeholder' => 'Add Link',
        ],
    ];

}
