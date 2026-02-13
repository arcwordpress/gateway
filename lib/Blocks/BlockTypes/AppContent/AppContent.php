<?php

namespace Gateway\Blocks\BlockTypes\AppContent;

class AppContent extends \Gateway\Block {

	protected static string $title = 'GTY App Content';

	public static function getName(): string {
		return 'gateway/app-content';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-app-content',
			'editor_style' => 'gateway-app-content-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<main ' . get_block_wrapper_attributes() . '><InnerBlocks /></main>';
	}
}
