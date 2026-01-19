<?php

namespace Gateway\Blocks\BlockTypes\Circle;

class Circle extends \Gateway\Block
{
    protected static string $title = 'Circle';

    /**
     * Get the block name
     */
    public static function getName(): string
    {
        return 'gateway/circle';
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
