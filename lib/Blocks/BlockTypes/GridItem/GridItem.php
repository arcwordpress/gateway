<?php

namespace Gateway\Blocks\BlockTypes\GridItem;

class GridItem extends \Gateway\Block
{
    protected static string $title = 'GTY Grid Item';

    /**
     * Get the block name
     */
    public static function getName(): string
    {
        return 'gateway/gty-grid-item';
    }

    /**
     * Register this block via code only (no block.json)
     */
    public static function getRegistrationType(): string
    {
        return 'code';
    }

    /**
     * Get block registration arguments
     */
    public static function getBlockArgs(): array
    {
        return [
            'api_version' => 3,
            'title' => 'GTY Grid Item',
            'category' => 'gateway-gtx',
            'supports' => [
                'html' => false,
            ],
        ];
    }

    /**
     * Render method — single-file template style.
     */
    public function render(array $attributes, string $content, $block): string
    {
        return '<div class="gateway-grid-item" style="padding:12px;border:1px solid #e6e6e6;"><InnerBlocks /></div>';
    }
}
