<?php

namespace Gateway\Blocks\BlockTypes\Grid;

class Grid extends \Gateway\Block
{
    protected static string $title = 'Grid';

    /**
     * Get the block name
     */
    public static function getName(): string
    {
        return 'gateway/grid';
    }

    /**
     * Render the block output
     */
    public function render(array $attributes, string $content, $block): string
    {
        ob_start();
        include __DIR__ . '/template.php';
        $output = ob_get_clean();
        return $output;
    }
}
