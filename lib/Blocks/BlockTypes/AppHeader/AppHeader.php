<?php

namespace Gateway\Blocks\BlockTypes\AppHeader;

class AppHeader extends \Gateway\Block {

	protected static string $title = 'GTY App Header';

	public static function getName(): string {
		return 'gateway/app-header';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-app-header',
			'editor_style' => 'gateway-app-header-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<header ' . get_block_wrapper_attributes() . '><InnerBlocks /></header>';
	}
}
