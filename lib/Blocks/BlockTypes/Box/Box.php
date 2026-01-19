<?php

namespace Gateway\Blocks\BlockTypes\Box;

class Box extends \Gateway\Block
{
    protected static string $title = 'Box';

    /**
     * Get the block name
     */
    public static function getName(): string
    {
        return 'gateway/box';
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
            'title' => 'Box',
            'category' => 'layout',
            'supports' => [
                'html' => false,
            ],
        ];
    }

    /**
     * Render the block output
     */
    public function render(array $attributes, string $content, $block): string
    {
        ob_start();
        include __DIR__ . '/template.php';
        $output = ob_get_clean();

        // Replace <InnerBlocks /> placeholder with actual rendered inner blocks content
        $output = preg_replace('/<InnerBlocks\s*\/?>/i', $content, $output);

        return $output;
    }
}
