<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class FileField extends \Gateway\Field {

    protected $type   = 'file';
    protected $fields = [
        [
            'name'        => 'allowedTypes',
            'label'       => 'Allowed File Types',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => 'image, application/pdf',
            'description' => 'Comma-separated MIME types or categories (image, video, audio)',
        ],
        [
            'name'        => 'buttonText',
            'label'       => 'Select Button Text',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select File',
            'placeholder' => 'Select File',
        ],
        [
            'name'        => 'mediaTitle',
            'label'       => 'Media Modal Title',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select File',
            'placeholder' => 'Select File',
        ],
        [
            'name'        => 'mediaButtonText',
            'label'       => 'Media Modal Button',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Use this file',
            'placeholder' => 'Use this file',
        ],
    ];

}
