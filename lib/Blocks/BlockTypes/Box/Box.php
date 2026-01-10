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
     * Render the block output
     */
    public function render(array $attributes, string $content, $block): string
    {
        ob_start();
        include __DIR__ . '/template.php';
        return ob_get_clean();
    }
}
