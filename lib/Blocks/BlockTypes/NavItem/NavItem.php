<?php

namespace Gateway\Blocks\BlockTypes\NavItem;

class NavItem extends \Gateway\Block {

	protected static string $title = 'Nav Item';

	public static function getName(): string {
		return 'gateway/gty-nav-item';
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
			'attributes' => [
				'label' => [
					'type' => 'string',
					'default' => 'Menu Item',
				],
				'href' => [
					'type' => 'string',
					'default' => '#',
				],
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		$label = ! empty( $attributes['label'] ) ? esc_html( $attributes['label'] ) : 'Menu Item';
		$href = ! empty( $attributes['href'] ) ? esc_url( $attributes['href'] ) : '#';
		return '<li ' . get_block_wrapper_attributes( [ 'class' => 'gty-nav-item' ] ) . '><a href="' . $href . '" class="gty-nav-item-link">' . $label . '</a></li>';
	}
}
