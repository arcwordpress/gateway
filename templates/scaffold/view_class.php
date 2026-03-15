<?php

namespace {{NAMESPACE}}\Views;

class {{CLASS_NAME}} extends \Gateway\View {

    protected $key          = '{{VIEW_KEY}}';
    protected $source       = '{{SOURCE_CLASS}}';
    protected $columns      = {{COLUMNS}};
    protected $facetFilters = {{FACET_FILTERS}};
    protected $defaultSort  = {{DEFAULT_SORT}};
    protected $perPage      = {{PER_PAGE}};
}
