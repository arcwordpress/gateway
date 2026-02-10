<?php

namespace Gateway\Blocks\BlockTypes\App;

class App extends \Gateway\Block {

	protected static string $title = 'GTY App';

	public static function getName(): string {
		return 'gateway/app';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-app',
			'editor_style' => 'gateway-app-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/app/default.css';
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<div ' . get_block_wrapper_attributes() . '><InnerBlocks /></div>';
	}
}
