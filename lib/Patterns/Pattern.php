<?php

namespace Gateway\Patterns;

/**
 * Base Pattern class for Gateway block patterns
 *
 * Provides structure and common functionality for creating
 * reusable block patterns composed of Gateway dynamic data blocks.
 */
abstract class Pattern {
    /**
     * Get the pattern slug/identifier
     *
     * @return string
     */
    abstract public function getSlug(): string;

    /**
     * Get the pattern title
     *
     * @return string
     */
    abstract public function getTitle(): string;

    /**
     * Get the pattern description
     *
     * @return string
     */
    abstract public function getDescription(): string;

    /**
     * Get the pattern categories
     *
     * @return array
     */
    public function getCategories(): array {
        return ['gateway'];
    }

    /**
     * Get the pattern keywords for search
     *
     * @return array
     */
    public function getKeywords(): array {
        return [];
    }

    /**
     * Get the pattern content (block markup)
     *
     * @return string
     */
    abstract public function getContent(): string;

    /**
     * Get the pattern block types
     *
     * @return array|null
     */
    public function getBlockTypes(): ?array {
        return null;
    }

    /**
     * Get the pattern viewport width
     *
     * @return int|null
     */
    public function getViewportWidth(): ?int {
        return null;
    }

    /**
     * Convert pattern to WordPress registration array
     *
     * @return array
     */
    public function toArray(): array {
        $pattern = [
            'title'       => $this->getTitle(),
            'description' => $this->getDescription(),
            'content'     => $this->getContent(),
            'categories'  => $this->getCategories(),
        ];

        if (!empty($this->getKeywords())) {
            $pattern['keywords'] = $this->getKeywords();
        }

        if ($this->getBlockTypes() !== null) {
            $pattern['blockTypes'] = $this->getBlockTypes();
        }

        if ($this->getViewportWidth() !== null) {
            $pattern['viewportWidth'] = $this->getViewportWidth();
        }

        return $pattern;
    }

    /**
     * Helper method to build block markup
     *
     * @param string $blockName The block name (e.g., 'gateway/data-source')
     * @param array $attributes Block attributes
     * @param string $innerContent Inner blocks HTML
     * @return string
     */
    protected function buildBlock(string $blockName, array $attributes = [], string $innerContent = ''): string {
        $attrs = !empty($attributes) ? ' ' . json_encode($attributes) : '';

        if ($innerContent) {
            return "<!-- wp:{$blockName}{$attrs} -->\n{$innerContent}\n<!-- /wp:{$blockName} -->";
        }

        return "<!-- wp:{$blockName}{$attrs} /-->";
    }

    /**
     * Helper method to wrap content in a group block
     *
     * @param string $innerContent Inner content
     * @param array $attributes Group attributes
     * @return string
     */
    protected function wrapInGroup(string $innerContent, array $attributes = []): string {
        return $this->buildBlock('core/group', $attributes, $innerContent);
    }

    /**
     * Helper method to wrap content in a columns block
     *
     * @param array $columns Array of column content
     * @param array $attributes Columns attributes
     * @return string
     */
    protected function buildColumns(array $columns, array $attributes = []): string {
        $columnBlocks = array_map(function($content) {
            return $this->buildBlock('core/column', [], $content);
        }, $columns);

        return $this->buildBlock('core/columns', $attributes, implode("\n\n", $columnBlocks));
    }
}
