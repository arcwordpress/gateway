<?php

namespace {{NAMESPACE}}\Collections;

class {{CLASS_NAME}} extends \Gateway\Collection {

    public static $registered = {{REGISTERED}};

    protected $key    = '{{COLLECTION_KEY}}';
    protected $title  = '{{COLLECTION_TITLE}}';
    protected $fields = {{FIELDS_JSON}};
{{RELATIONSHIP_METHODS}}
}
