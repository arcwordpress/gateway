<?php

namespace Gateway;

abstract class Block {
    
    protected static string $title = '';
    protected static ?string $blockDir = null;
    
    /**
     * Get the block name (e.g., 'gateway/box')
     */
    abstract public static function getName(): string;
    
    /**
     * Get the block title
     */
    public static function getTitle(): string
    {
        return static::$title;
    }
    
    /**
     * Get the block category slug
     */
    public static function getCategory(): ?string
    {
        $registration_type = static::getRegistrationType();

        if ($registration_type === 'code') {
            $args = static::getBlockArgs();
            return $args['category'] ?? null;
        } elseif ($registration_type === 'json') {
            $json_path = static::getBlockDir() . '/block.json';
            if (file_exists($json_path)) {
                $json_data = json_decode(file_get_contents($json_path), true);
                return $json_data['category'] ?? null;
            }
        }
        return null;
    }
    
    /**
     * Get the block directory path
     * Uses reflection to find the class file location if not explicitly set
     */
    public static function getBlockDir(): string
    {
        if (static::$blockDir !== null) {
            return static::$blockDir;
        }
        
        $reflection = new \ReflectionClass(static::class);
        return dirname($reflection->getFileName());
    }
    
    /**
     * Check if the block template contains InnerBlocks
     * Calls the actual render() method to check, so it works with
     * both file-based templates and method-based templates.
     */
    public static function hasInnerBlocks(): bool
    {
        try {
            // Create a temporary instance and call render() to check if
            // it returns content with <InnerBlocks> placeholder
            $instance = new static();
            $output = $instance->render([], '', null);
            
            // Check if output contains <InnerBlocks> in any form
            return preg_match('/<InnerBlocks\b/i', $output) === 1;
        } catch (\Throwable $e) {
            // If we can't instantiate or render, assume no inner blocks
            return false;
        }
    }

    /**
     * Get block metadata for API/JS consumption
     */
    public static function getMetadata(): array
    {
        $metadata = [
            'name' => static::getName(),
            'title' => static::getTitle(),
            'hasInnerBlocks' => static::hasInnerBlocks(),
        ];

        if ($category = static::getCategory()) {
            $metadata['category'] = $category;
        }

        return $metadata;
    }

    /**
     * Get the registration type for this block
     * 'json' = register via block.json (default)
     * 'code' = register via code only
     */
    public static function getRegistrationType(): string
    {
        return 'json';
    }

    /**
     * Get block registration arguments for code-based registration
     * Only used when getRegistrationType() returns 'code'
     * 
     * @return array Arguments to pass to register_block_type()
     */
    public static function getBlockArgs(): array
    {
        return [];
    }
    
    /**
     * Render the block output
     */
    abstract public function render(array $attributes, string $content, $block): string;

    /**
     * Central render callback used when registering blocks with WordPress.
     * Calls the concrete `render()` implementation and then ensures any
     * <InnerBlocks ...> placeholder is replaced with the rendered inner
     * blocks content. This allows templates to include <InnerBlocks/> in
     * any form (attributes, self-closing or with closing tag).
     *
     * @see BlockInit::registerBlocks() — registration will use this callback.
     */
    public function renderCallback(array $attributes, string $content, $block): string
    {
        $output = $this->render($attributes, $content, $block);

        // Replace <InnerBlocks ... /> or <InnerBlocks ...></InnerBlocks> (with any attributes or content)
        // Match from < to > inclusive, handling self-closing and paired tags
        $output = preg_replace('/<InnerBlocks\b[^>]*(?:\/>|>(?:.*?)<\/InnerBlocks\s*>)/is', $content, $output);

        return $output;
    }
    
    /**
     * Register this block
     */
    public static function register(): void
    {
        $instance = new static();
        \Gateway\Blocks\BlockRegistry::instance()->register($instance);
    }
}
