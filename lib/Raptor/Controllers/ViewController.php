<?php

namespace Gateway\Raptor\Controllers;

use Gateway\Raptor\Collections\RaptorView;

if (!defined('ABSPATH')) {
    exit;
}

class ViewController
{
    public static function create(array $attributes): RaptorView
    {
        return RaptorView::create($attributes);
    }

    public static function update(RaptorView $view, array $attributes): RaptorView
    {
        $view->update($attributes);
        return $view->fresh();
    }

    public static function delete(RaptorView $view): bool
    {
        return $view->delete();
    }

    public static function get(string $viewKey): ?RaptorView
    {
        return RaptorView::where('view_key', $viewKey)->first();
    }

    public static function withNested(RaptorView $view): RaptorView
    {
        return $view->load('collection');
    }
}
