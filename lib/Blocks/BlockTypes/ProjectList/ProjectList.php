<?php

namespace Gateway\Blocks\BlockTypes\ProjectList;

class ProjectList extends \Gateway\Block
{
    protected static string $title = 'Project List';

    /**
     * Get the block name
     */
    public static function getName(): string
    {
        return 'gateway/project-list';
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
