<?php

namespace Gateway\Blocks\BlockTypes\Logo;

class Logo extends \Gateway\Block {

	protected static string $title = 'Logo';

	public static function getName(): string {
		return 'gateway/logo';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-logo',
			'editor_style' => 'gateway-logo-editor',
			'supports' => [
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<div ' . get_block_wrapper_attributes( [ 'class' => 'logo' ] ) . '><button type="button" class="logo-link" data-wp-interactive="gateway/router" data-wp-on--click="actions.navigate" data-path="/">{{INNER_BLOCKS}}</button></div>';
	}
}
