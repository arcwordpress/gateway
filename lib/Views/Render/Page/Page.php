<?php

namespace Gateway\Views\Render\Page;

abstract class Page
{
    abstract public function getTitle(): string;

    abstract public function getSlug(): string;

    abstract public function getContent(): string;

    public function create(): void
    {
        if (get_page_by_path($this->getSlug())) {
            return;
        }

        wp_insert_post([
            'post_title'   => $this->getTitle(),
            'post_name'    => $this->getSlug(),
            'post_content' => $this->getContent(),
            'post_type'    => 'page',
            'post_status'  => 'publish',
        ]);
    }
}
