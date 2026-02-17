<?php 

namespace Gateway\Forms\Fields\FieldTypes;

class GalleryField extends \Gateway\Field {

    protected $type   = 'gallery';
    protected $fields = [
        [
            'name'        => 'maxImages',
            'label'       => 'Max Images',
            'type'        => 'text',
            'required'    => false,
            'placeholder' => '',
            'description' => 'Leave empty for no limit',
        ],
        [
            'name'        => 'thumbnailSize',
            'label'       => 'Thumbnail Size',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'thumbnail',
            'placeholder' => 'thumbnail',
            'description' => 'WordPress image size: thumbnail, medium, large, full',
        ],
        [
            'name'        => 'buttonText',
            'label'       => 'Add Button Text',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Add Images',
            'placeholder' => 'Add Images',
        ],
        [
            'name'        => 'mediaTitle',
            'label'       => 'Media Modal Title',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Select Images',
            'placeholder' => 'Select Images',
        ],
        [
            'name'        => 'mediaButtonText',
            'label'       => 'Media Modal Button',
            'type'        => 'text',
            'required'    => false,
            'default'     => 'Add to gallery',
            'placeholder' => 'Add to gallery',
        ],
    ];

}
