<?php

namespace Gateway\Integrations\Breakdance\Elements;

if (!defined('ABSPATH')) {
    exit;
}

use function Breakdance\Elements\c;

\Breakdance\ElementStudio\registerElementForEditing(
    'Gateway\\Integrations\\Breakdance\\Elements\\GatewayView',
    \Breakdance\Util\getDirectoryPathRelativeToPluginFolder(__DIR__)
);

class GatewayView extends \Breakdance\Elements\Element
{
    public static function uiIcon(): string
    {
        return 'TableIcon';
    }

    public static function tag(): string
    {
        return 'div';
    }

    public static function tagOptions(): array
    {
        return [];
    }

    public static function tagControlPath(): bool
    {
        return false;
    }

    public static function name(): string
    {
        return 'Gateway Grid';
    }

    public static function className(): string
    {
        return 'gateway-breakdance-grid';
    }

    public static function category(): string
    {
        return 'gateway';
    }

    public static function slug(): string
    {
        return __CLASS__;
    }

    public static function template(): string
    {
        return file_get_contents(__DIR__ . '/html.twig');
    }

    public static function defaultCss()
    {
        return false;
    }

    public static function cssTemplate()
    {
        return false;
    }

    public static function defaultProperties()
    {
        return [
            'content' => [
                'show_filters' => true,
                'per_page'     => 20,
            ],
        ];
    }

    public static function defaultChildren()
    {
        return false;
    }

    public static function contentControls(): array
    {
        return [
            c(
                'collection',
                'Collection',
                [],
                ['type' => 'text', 'layout' => 'inline', 'placeholder' => 'e.g. listings'],
                false,
                false,
                []
            ),
            c(
                'show_filters',
                'Show Filters',
                [],
                ['type' => 'toggle', 'layout' => 'inline'],
                false,
                false,
                []
            ),
            c(
                'per_page',
                'Per Page',
                [],
                ['type' => 'number', 'layout' => 'inline', 'min' => 1, 'max' => 200],
                false,
                false,
                []
            ),
        ];
    }

    public static function designControls(): array
    {
        return [];
    }

    public static function settingsControls(): array
    {
        return [];
    }

    public static function nestingRule(): array
    {
        return ['type' => 'final'];
    }

    public static function spacingBars(): array
    {
        return [
            [
                'location'             => 'outside-top',
                'cssProperty'          => 'margin-top',
                'affectedPropertyPath' => 'design.spacing.margin_top.%%BREAKPOINT%%',
            ],
            [
                'location'             => 'outside-bottom',
                'cssProperty'          => 'margin-bottom',
                'affectedPropertyPath' => 'design.spacing.margin_bottom.%%BREAKPOINT%%',
            ],
        ];
    }

    public static function propertyPathsToSsrElementWhenValueChanges(): array
    {
        return ['content.collection', 'content.show_filters', 'content.per_page'];
    }

    public static function settings()
    {
        return false;
    }

    public static function addPanelRules()
    {
        return false;
    }

    public static function actions()
    {
        return false;
    }

    public static function attributes()
    {
        return false;
    }

    public static function experimental(): bool
    {
        return false;
    }

    public static function order(): int
    {
        return 10;
    }

    public static function dynamicPropertyPaths(): array
    {
        return [];
    }

    public static function additionalClasses()
    {
        return false;
    }

    public static function projectManagement()
    {
        return false;
    }

    public static function propertyPathsToWhitelistInFlatProps()
    {
        return false;
    }

    public static function dependencies()
    {
        return false;
    }
}
