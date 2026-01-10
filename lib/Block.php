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
     */
    public static function hasInnerBlocks(): bool
    {
        $templatePath = static::getBlockDir() . '/template.php';

        if (!file_exists($templatePath)) {
            return false;
        }

        $templateContent = file_get_contents($templatePath);

        // Check for <InnerBlocks /> or <InnerBlocks> or <InnerBlocks/>
        return preg_match('/<InnerBlocks\s*\/?>/i', $templateContent) === 1;
    }

    /**
     * Get block metadata for API/JS consumption
     */
    public static function getMetadata(): array
    {
        return [
            'name' => static::getName(),
            'title' => static::getTitle(),
            'hasInnerBlocks' => static::hasInnerBlocks(),
        ];
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
     * Register this block
     */
    public static function register(): void
    {
        $instance = new static();
        \Gateway\Blocks\BlockRegistry::instance()->register($instance);
    }
}