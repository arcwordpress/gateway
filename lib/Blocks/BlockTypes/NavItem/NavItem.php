<?php

namespace Gateway\Blocks\BlockTypes\NavItem;

class NavItem extends \Gateway\Block {

	protected static string $title = 'Nav Item';

	protected static array $fields = [
		[
			'name' => 'label',
			'type' => 'text',
			'default' => 'Menu Item',
		],
		[
			'name' => 'path',
			'type' => 'text',
			'default' => '/',
		],
	];

	public static function getName(): string {
		return 'gateway/nav-item';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-nav-item',
			'editor_style' => 'gateway-nav-item-editor',
			'supports' => [
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		$label = ! empty( $attributes['label'] ) ? esc_html( $attributes['label'] ) : 'Menu Item';
		$path = ! empty( $attributes['path'] ) ? esc_attr( $attributes['path'] ) : '/';
		return '<li ' . get_block_wrapper_attributes( [ 'class' => 'nav-item' ] ) . '><button type="button" class="nav-item-link" data-wp-interactive="gateway/router" data-wp-on--click="actions.navigate" data-path="' . $path . '">' . $label . '</button></li>';
	}
}
