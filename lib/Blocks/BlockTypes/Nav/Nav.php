<?php

namespace Gateway\Blocks\BlockTypes\Nav;

class Nav extends \Gateway\Block {

	protected static string $title = 'GTY Nav';

	public static function getName(): string {
		return 'gateway/gty-nav';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'layout',
			'style' => 'gateway-nav',
			'editor_style' => 'gateway-nav-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/nav/default.css';
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<nav ' . get_block_wrapper_attributes( [ 'class' => 'gty-nav' ] ) . '><ul class="gty-nav-list"><InnerBlocks /></ul></nav>';
	}
}
