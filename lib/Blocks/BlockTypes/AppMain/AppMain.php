<?php

namespace Gateway\Blocks\BlockTypes\AppMain;

class AppMain extends \Gateway\Block {

	protected static string $title = 'GTY App Main';

	public static function getName(): string {
		return 'gateway/gty-app-main';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'layout',
			'style' => 'gateway-app-main',
			'editor_style' => 'gateway-app-main-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/app-main/default.css';
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<header ' . get_block_wrapper_attributes( [ 'class' => 'app-main' ] ) . '><InnerBlocks /></header>';
	}
}
