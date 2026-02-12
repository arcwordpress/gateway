<?php

namespace Gateway\Blocks\BlockTypes\Flex;

class Flex extends \Gateway\Block {

	protected static string $title = 'GTY Flex';

	public static function getName(): string {
		return 'gateway/gty-flex';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-flex',
			'editor_style' => 'gateway-flex-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<div ' . get_block_wrapper_attributes( [ 'class' => 'gty-flex' ] ) . '><InnerBlocks /></div>';
	}
}
