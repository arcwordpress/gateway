<?php

namespace Gateway\Blocks\BlockTypes\Nav;

class Nav extends \Gateway\Block {

	protected static string $title = 'Nav';

	protected static array $fields = [
		[
			'name' => 'orientation',
			'type' => 'text',
			'default' => 'column',
		],
	];

	public static function getName(): string {
		return 'gateway/nav';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-nav',
			'editor_style' => 'gateway-nav-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		$orientation = ! empty( $attributes['orientation'] ) ? esc_attr( $attributes['orientation'] ) : 'column';
		$classes = 'nav-list nav-list--' . $orientation;
		return '<nav ' . get_block_wrapper_attributes( [ 'class' => 'nav' ] ) . '><ul class="' . $classes . '"><InnerBlocks /></ul></nav>';
	}
}
