<?php

namespace Gateway\Blocks\JsonBlock;

/**
 * Registers JSON block definitions with WordPress and the Gutenberg editor.
 *
 * Bridges JsonBlockLoader (definitions) with:
 *   - WordPress core: register_block_type() on init
 *   - Gutenberg editor: appends block metadata to window.gatewayBlocks so
 *     the existing js/php-block-scripts/src/index.js picks them up without
 *     any JS changes.
 *
 * Template rendering uses the same <InnerBlocks> regex as Block::renderCallback()
 * (lib/Block.php:237) so InnerBlocks behaviour is consistent across both systems.
 */
class JsonBlockRegistrar
{
    /**
     * Wire up WordPress hooks.
     * Called once from Plugin.php during plugin initialisation.
     */
    public static function init(): void
    {
        JsonBlockLoader::setDirectory(GATEWAY_PATH . 'schema/blocks/types');

        // Same priority as BlockInit::registerBlocks (priority 10)
        add_action('init', [self::class, 'registerWithWordPress'], 10);

        // Priority 20: runs after BlockInit::enqueueBlockEditorAssets (default 10)
        // so gateway-php-block-scripts is already enqueued when we append to it
        add_action('enqueue_block_editor_assets', [self::class, 'appendToEditorMeta'], 20);
    }

    /**
     * Load all JSON block definitions and register each with WordPress.
     * Runs on the 'init' hook.
     */
    public static function registerWithWordPress(): void
    {
        JsonBlockLoader::load();

        foreach (JsonBlockLoader::getAll() as $definition) {
            self::registerOne($definition);
        }
    }

    /**
     * Register a single JSON block definition with WordPress.
     */
    private static function registerOne(array $definition): void
    {
        $name = $definition['name'];

        $args = [
            'title'                 => $definition['title'],
            'category'              => $definition['category'] ?? 'gateway',
            'icon'                  => $definition['icon'] ?? 'block-default',
            'description'           => $definition['description'] ?? '',
            'keywords'              => $definition['keywords'] ?? [],
            'supports'              => $definition['supports'] ?? ['html' => false],
            'attributes'            => self::buildAttributes($definition),
            'editor_script_handles' => ['gateway-php-block-scripts'],
            'render_callback'       => static function (array $attributes, string $content) use ($definition): string {
                return self::render($definition, $attributes, $content);
            },
        ];

        if (!empty($definition['parent'])) {
            $args['parent'] = $definition['parent'];
        }

        if (!empty($definition['allowedBlocks'])) {
            $args['allowed_blocks'] = $definition['allowedBlocks'];
        }

        register_block_type($name, $args);
    }

    /**
     * Append JSON block metadata to window.gatewayBlocks after the main
     * gateway-php-block-scripts is already localised by BlockInit.
     *
     * index.js reads gatewayBlocks and calls registerBlockType() for each entry,
     * so JSON blocks flow through the same JS path as PHP blocks.
     */
    public static function appendToEditorMeta(): void
    {
        $definitions = JsonBlockLoader::getAll();
        if (empty($definitions)) {
            return;
        }

        if (!wp_script_is('gateway-php-block-scripts', 'enqueued')) {
            return;
        }

        $meta = array_values(array_map(
            [JsonBlockLoader::class, 'toEditorMeta'],
            $definitions
        ));

        $json = wp_json_encode($meta);

        // Safely append to the existing array regardless of initialisation order
        wp_add_inline_script(
            'gateway-php-block-scripts',
            "if (typeof gatewayBlocks !== 'undefined') { gatewayBlocks = gatewayBlocks.concat({$json}); } else { var gatewayBlocks = {$json}; }",
            'after'
        );
    }

    /**
     * Render a JSON block by substituting {{fieldName}} placeholders in the
     * template string with escaped attribute values.
     *
     * The template is developer-authored and trusted. Field values are user
     * input and are escaped with esc_html(). <InnerBlocks ... /> is replaced
     * with the WordPress-rendered $content string using the same regex as
     * Block::renderCallback() (lib/Block.php:237).
     */
    public static function render(array $definition, array $attributes, string $content): string
    {
        $template = $definition['template'] ?? '';
        if ($template === '') {
            return $content;
        }

        // Substitute attribute values, falling back to field defaults
        $fields = [];
        foreach ($definition['fields'] ?? [] as $field) {
            $fields[$field['name']] = $field;
        }

        foreach ($fields as $name => $field) {
            $value = array_key_exists($name, $attributes)
                ? $attributes[$name]
                : ($field['default'] ?? '');

            $template = str_replace(
                '{{' . $name . '}}',
                esc_html((string) $value),
                $template
            );
        }

        // Replace any remaining unmatched {{placeholders}} with empty string
        $template = preg_replace('/\{\{[a-z0-9_-]+\}\}/i', '', $template);

        // Replace <InnerBlocks ... /> or <InnerBlocks ...></InnerBlocks>
        // Mirrors the regex in Block::renderCallback() (lib/Block.php:237)
        $template = preg_replace(
            '/<InnerBlocks\b[^>]*(?:\/>|>(?:.*?)<\/InnerBlocks\s*>)/is',
            $content,
            $template
        );

        return $template;
    }

    /**
     * Build WordPress block attribute definitions from the Gateway fields array.
     * Mirrors the logic in BlockInit::buildFieldAttributes().
     */
    private static function buildAttributes(array $definition): array
    {
        $fields = $definition['fields'] ?? [];
        if (empty($fields)) {
            return [];
        }

        $attributes = [];
        foreach ($fields as $field) {
            $name = $field['name'] ?? '';
            if ($name === '') {
                continue;
            }

            $type = ($field['type'] ?? 'text') === 'number' ? 'number' : 'string';
            $attr = ['type' => $type];

            if (array_key_exists('default', $field)) {
                $attr['default'] = $field['default'];
            } else {
                $attr['default'] = $type === 'number' ? 0 : '';
            }

            $attributes[$name] = $attr;
        }

        return $attributes;
    }
}
