<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class ImageField extends \Gateway\Field {

    protected $type   = 'image';
    protected $fields = [
        [
            'name'        => 'imageSize',
            'label'       => 'Image Size',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'medium',
            'placeholder' => 'medium',
            'description' => 'WordPress image size: thumbnail, medium, large, full',
        ],
        [
            'name'        => 'previewHeight',
            'label'       => 'Preview Height',
            'type'        => 'text',
            'required'    => false,
            'default'     => '200px',
            'placeholder' => '200px',
            'description' => 'CSS height of the preview area, e.g. 200px',
        ],
        [
            'name'        => 'buttonText',
            'label'       => 'Select Button Text',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select Image',
            'placeholder' => 'Select Image',
        ],
        [
            'name'        => 'mediaTitle',
            'label'       => 'Media Modal Title',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select Image',
            'placeholder' => 'Select Image',
        ],
        [
            'name'        => 'mediaButtonText',
            'label'       => 'Media Modal Button',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Use this image',
            'placeholder' => 'Use this image',
        ],
    ];

}
