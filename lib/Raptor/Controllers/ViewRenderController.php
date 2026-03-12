<?php

namespace Gateway\Raptor\Controllers;

use Gateway\Raptor\Collections\RaptorViewRender;
use Gateway\Raptor\Collections\RaptorView;

if (!defined('ABSPATH')) {
    exit;
}

class ViewRenderController
{
    public static function getForView(RaptorView $view): \Illuminate\Database\Eloquent\Collection
    {
        return RaptorViewRender::where('view_id', $view->id)
            ->orderBy('id', 'asc')
            ->get();
    }

    public static function create(RaptorView $view, string $engine, string $jsType): RaptorViewRender
    {
        return RaptorViewRender::create([
            'view_id' => $view->id,
            'engine'  => $engine,
            'js_type' => $jsType,
        ]);
    }

    public static function find(int $id): ?RaptorViewRender
    {
        return RaptorViewRender::find($id);
    }

    public static function delete(RaptorViewRender $render): bool
    {
        return (bool) $render->delete();
    }
}
