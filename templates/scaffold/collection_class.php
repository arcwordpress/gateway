<?php

namespace {{NAMESPACE}}\Collections;

class {{CLASS_NAME}} extends \Gateway\Collection {

    public static $registered = {{REGISTERED}};

    protected $key     = '{{COLLECTION_KEY}}';
    protected $title   = '{{COLLECTION_TITLE}}';
{{PACKAGE_PROPERTY}}{{LABEL_FIELD_PROPERTY}}{{DISPLAY_FIELD_PROPERTY}}{{SEARCHABLE_PROPERTY}}    protected $fields  = {{FIELDS_JSON}};
{{RELATIONSHIP_METHODS}}
}
