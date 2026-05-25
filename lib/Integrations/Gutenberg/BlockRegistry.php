<?php

namespace Gateway\Integrations\Gutenberg;

class BlockRegistry
{
    public static function init(): void
    {
        add_filter( 'block_categories_all', [ static::class, 'addCategory' ] );
        add_action( 'init', [ static::class, 'registerAll' ] );
    }

    public static function addCategory( array $categories ): array
    {
        foreach ( $categories as $cat ) {
            if ( $cat['slug'] === 'gateway' ) {
                return $categories;
            }
        }
        array_unshift( $categories, [
            'slug'  => 'gateway',
            'title' => 'Gateway',
            'icon'  => null,
        ] );
        return $categories;
    }

    public static function registerAll(): void
    {
        $build_dir = GATEWAY_PATH . 'react/block-types/build/blocks/';

        if ( ! is_dir( $build_dir ) ) {
            return;
        }

        foreach ( glob( $build_dir . '*/block.json' ) ?: [] as $block_json ) {
            $block_dir  = dirname( $block_json );
            $block_name = basename( $block_dir );
            $class      = __NAMESPACE__ . '\\' . self::slugToClass( $block_name ) . 'Block';

            $args = [];
            if ( class_exists( $class ) ) {
                $instance         = new $class();
                $args['render_callback'] = [ $instance, 'render' ];
            }

            register_block_type( $block_dir, $args );
        }
    }

    private static function slugToClass( string $slug ): string
    {
        return str_replace( ' ', '', ucwords( str_replace( [ '-', '_' ], ' ', $slug ) ) );
    }
}
