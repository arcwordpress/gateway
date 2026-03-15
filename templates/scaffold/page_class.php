<?php

namespace {{NAMESPACE}}\Pages;

class {{CLASS_NAME}} extends \Gateway\Views\Render\Page\Page
{
    public function getTitle(): string
    {
        return '{{PAGE_TITLE}}';
    }

    public function getSlug(): string
    {
        return '{{PAGE_SLUG}}';
    }

    public function getContent(): string
    {
        return '{{PAGE_CONTENT}}';
    }
}
