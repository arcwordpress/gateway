<?php

namespace Gateway\Integrations\Breakdance\Elements;

use function Breakdance\Elements\c;

\Breakdance\ElementStudio\registerElementForEditing(
    'Gateway\\Integrations\\Breakdance\\Elements\\GatewayGrid',
    __DIR__
);

class GatewayGrid extends \Breakdance\Elements\Element
{
    static function uiIcon()
    {
        return 'TableIcon';
    }

    static function tag()
    {
        return 'div';
    }

    static function tagOptions()
    {
        return [];
    }

    static function tagControlPath()
    {
        return false;
    }

    static function name()
    {
        return 'Gateway Grid';
    }

    static function className()
    {
        return 'gateway-bd-grid';
    }

    static function category()
    {
        return 'other';
    }

    static function badge()
    {
        return false;
    }

    static function slug()
    {
        return __CLASS__;
    }

    static function template()
    {
        return file_get_contents(__DIR__ . '/html.twig');
    }

    static function defaultCss()
    {
        return false;
    }

    static function cssTemplate()
    {
        return false;
    }

    static function defaultProperties()
    {
        return [
            'content' => [
                'show_filters' => true,
                'per_page'     => 20,
            ],
        ];
    }

    static function defaultChildren()
    {
        return false;
    }

    static function availableIn()
    {
        return ['breakdance'];
    }

    static function contentControls()
    {
        $collectionItems = self::buildCollectionItems();

        $collectionControl = count($collectionItems) > 0
            ? ['type' => 'select', 'layout' => 'inline', 'items' => $collectionItems]
            : ['type' => 'text',   'layout' => 'inline', 'placeholder' => 'e.g. listings'];

        return [
            c('collection', 'Collection', [], $collectionControl, false, false, []),
            c('show_filters', 'Show Filters', [], ['type' => 'toggle', 'layout' => 'inline'], false, false, []),
            c('per_page', 'Per Page', [], ['type' => 'number', 'layout' => 'inline', 'min' => 1, 'max' => 200], false, false, []),
        ];
    }

    static function designControls()
    {
        return [];
    }

    static function settingsControls()
    {
        return [];
    }

    static function dependencies()
    {
        return false;
    }

    static function settings()
    {
        return false;
    }

    static function addPanelRules()
    {
        return false;
    }

    static function actions()
    {
        return false;
    }

    static function nestingRule()
    {
        return ['type' => 'final'];
    }

    static function spacingBars()
    {
        return false;
    }

    static function attributes()
    {
        return false;
    }

    static function experimental()
    {
        return false;
    }

    static function order()
    {
        return 0;
    }

    static function dynamicPropertyPaths()
    {
        return false;
    }

    static function additionalClasses()
    {
        return false;
    }

    static function projectManagement()
    {
        return false;
    }

    static function propertyPathsToWhitelistInFlatProps()
    {
        return false;
    }

    static function propertyPathsToSsrElementWhenValueChanges()
    {
        return ['content.collection', 'content.show_filters', 'content.per_page'];
    }

    private static function buildCollectionItems(): array
    {
        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if (!$registry) return [];

            $items = [['value' => '', 'title' => '— Select a collection —']];

            foreach ($registry->getAll() as $key => $collection) {
                if (method_exists($collection, 'isHidden') && $collection->isHidden()) {
                    continue;
                }
                $title   = method_exists($collection, 'getTitle') ? $collection->getTitle() : $key;
                $items[] = ['value' => $key, 'title' => $title . ' (' . $key . ')'];
            }

            return count($items) > 1 ? $items : [];
        } catch (\Throwable $e) {
            return [];
        }
    }
}
